# Agent Workflow UI - Implementation Plan

## Overview

Add a UI visualization and control plane for agent workflows in the Growth OS dashboard. This enables running and monitoring Producer → Evaluator → Reviser loops from the web UI instead of CLI.

---

## 1. Architecture (MVP)

**Approach: Local Runner with Direct DB Writes**

```
┌─────────────────┐                        ┌─────────────────┐
│  Local Machine  │──────────────────────▶│   Turso DB      │
│  (loop-engine)  │  (direct Drizzle)     │                 │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                           ┌────────▼────────┐
                                           │  Vercel API     │
                                           │  dashboard/api/ │
                                           └────────┬────────┘
                                                    │
                                           ┌────────▼────────┐
                                           │   Dashboard     │
                                           │   (polling)     │
                                           └─────────────────┘
```

**Why this approach:**
- Vercel serverless has timeout limits - cannot run long workflows directly
- Local runner writes status directly to Turso via Drizzle (simpler than HTTP callbacks)
- Dashboard polls Vercel API which reads from Turso
- Can add SSE later if needed for lower latency

**Key changes to LoopEngine:**
- Add optional `--workflow-id` CLI flag
- Import schema from `dashboard/api/_lib/db/schema.ts` (single source of truth)
- Write events directly to `workflow_events` table
- Claim job atomically before starting (prevent double-processing)
- Check `cancelRequestedAt` between stages and exit gracefully
- Update `heartbeatAt` periodically to detect stalled runs

---

## 2. Data Model

### Single Schema Source of Truth

All tables defined in `dashboard/api/_lib/db/schema.ts`. The runner imports from this same file.

### New Tables

**Table: `workflow_runs`** - Parent record for entire loop execution
```typescript
export const workflowRuns = sqliteTable('workflow_runs', {
  id: text('id').primaryKey(),                    // UUID, e.g. "run_abc123"
  agentName: text('agent_name').notNull(),        // e.g. "target_builder"
  cycleId: text('cycle_id').notNull(),            // e.g. "2026-02-01-001"
  status: text('status').notNull(),               // 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
  currentStage: text('current_stage'),            // 'producing' | 'evaluating' | 'revising' | null
  currentAttempt: integer('current_attempt').default(1),
  maxAttempts: integer('max_attempts').notNull(),
  passThreshold: real('pass_threshold').notNull(),
  finalScore: real('final_score'),
  errorMessage: text('error_message'),
  inputs: text('inputs'),                         // JSON string

  // Claim/lock fields (prevent double-processing)
  claimedAt: text('claimed_at'),                  // Set when runner picks up job
  claimedBy: text('claimed_by'),                  // Runner identifier (hostname/pid)

  // Runner health fields
  heartbeatAt: text('heartbeat_at'),              // Updated periodically by runner
  cancelRequestedAt: text('cancel_requested_at'), // Set by API, checked by runner

  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
```

**Table: `workflow_events`** - Real-time event log for UI updates
```typescript
export const workflowEvents = sqliteTable('workflow_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),                // FK to workflow_runs.id
  eventType: text('event_type').notNull(),        // 'stage_change' | 'log' | 'score_update' | 'error'
  stage: text('stage'),                           // 'producing' | 'evaluating' | 'revising'
  attempt: integer('attempt'),
  message: text('message'),
  metadata: text('metadata'),                     // JSON: { score, feedback }
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
```

**Table: `workflow_artifacts`** - Store artifact content for UI display
```typescript
export const workflowArtifacts = sqliteTable('workflow_artifacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),                // FK to workflow_runs.id
  attempt: integer('attempt').notNull(),
  artifactType: text('artifact_type').notNull(),  // 'output' | 'evaluation'
  filename: text('filename').notNull(),           // e.g. "attempt-1.md"
  content: text('content').notNull(),             // Full file content
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
```

**Relationship to existing `agent_runs`:**
- `agent_runs` = detailed per-attempt records (keep as-is for backward compat)
- `workflow_runs` = parent record for entire loop
- `workflow_events` = real-time event stream
- `workflow_artifacts` = artifact content for UI display

---

## 3. API Endpoints

All endpoints in `dashboard/api/` directory. Uses query params for IDs (matches existing pattern).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/workflows` | List runs (filter: `?status=X&agent=Y`) |
| `GET` | `/api/workflows?id=X` | Get single run |
| `POST` | `/api/workflows` | Create new run (status: queued) |
| `GET` | `/api/workflow-events?runId=X` | Get events for timeline |
| `GET` | `/api/workflow-artifacts?runId=X` | Get artifacts for a run |
| `POST` | `/api/workflow-cancel?id=X` | Set `cancelRequestedAt` |
| `POST` | `/api/workflow-retry?id=X` | Create new run with same inputs |
| `GET` | `/api/agents-config` | Get available agents from agents.yaml |

**Files to create:**
- `dashboard/api/workflows.ts` - List, get single, create
- `dashboard/api/workflow-events.ts` - Events for a run
- `dashboard/api/workflow-artifacts.ts` - Artifacts for a run
- `dashboard/api/workflow-cancel.ts` - Cancel endpoint
- `dashboard/api/workflow-retry.ts` - Retry endpoint
- `dashboard/api/agents-config.ts` - Expose agents.yaml

---

## 4. Runner Job Claiming (Prevent Double-Processing)

When runner picks up a queued job:

```typescript
// Atomic claim: only succeeds if still queued and unclaimed
const result = await db
  .update(workflowRuns)
  .set({
    status: 'running',
    claimedAt: new Date().toISOString(),
    claimedBy: `${hostname()}:${process.pid}`,
    startedAt: new Date().toISOString(),
  })
  .where(
    and(
      eq(workflowRuns.id, runId),
      eq(workflowRuns.status, 'queued'),
      isNull(workflowRuns.claimedAt)  // Not already claimed
    )
  )
  .returning();

if (result.length === 0) {
  // Already claimed by another runner, skip
  return;
}
```

---

## 5. Cancel/Retry Logic

**Cancel Flow:**
1. UI calls `POST /api/workflow-cancel?id=X`
2. API sets `cancelRequestedAt = now()` in `workflow_runs`
3. Runner checks `cancelRequestedAt` between stages (after produce, after evaluate)
4. If set, runner updates status to `cancelled` and exits gracefully
5. UI sees status change on next poll

**Retry Flow:**
1. UI calls `POST /api/workflow-retry?id=X`
2. API reads original run's `agentName`, `inputs`, `maxAttempts`, `passThreshold`
3. API creates a **new** `workflow_runs` row with:
   - New `id`, new `cycleId`, `status: 'queued'`
   - Same agent config and inputs
4. Returns new run ID for UI to navigate to

**Stalled Run Detection:**
- Runner updates `heartbeatAt` every 30s
- UI shows "stalled" warning if `heartbeatAt` > 2 minutes old and status is `running`

---

## 6. UI Components

### Routes (add to `dashboard/src/App.tsx`)
```typescript
<Route path="agents" element={<Agents />} />
<Route path="agents/:runId" element={<AgentRunDetail />} />
```

### Page: `/agents` - Workflow List
```
┌─────────────────────────────────────────────────────────────┐
│  Agent Workflows                                            │
│  Monitor and control automated workflows                    │
├─────────────────────────────────────────────────────────────┤
│  [+ Start Workflow]                    [Filter ▼] [Sort ▼]  │
├─────────────────────────────────────────────────────────────┤
│  ● target_builder   run_abc123   Running (2/3)     1m ago   │
│  ✓ target_builder   run_xyz789   Passed (0.91)     2h ago   │
│  ✗ signal_scanner   run_def456   Failed (0.65)     5h ago   │
└─────────────────────────────────────────────────────────────┘
```

### Page: `/agents/:runId` - Run Detail
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                   [Retry] [Cancel]  │
│  target_builder • run_abc123                                │
│  Status: Running • Attempt 2/3 • Score: 0.72                │
├─────────────────────────────────────────────────────────────┤
│  Timeline                                                   │
│  ● 10:00:00  Queued                                        │
│  ● 10:00:02  Started - Attempt 1                           │
│  ● 10:00:15  Produced (attempt-1.md)                       │
│  ● 10:00:45  Evaluated - Score: 0.72                       │
│  ○ 10:01:00  Revising... (in progress)                     │
├─────────────────────────────────────────────────────────────┤
│  Inputs: thesis, trigger_library, ...                       │
├─────────────────────────────────────────────────────────────┤
│  Artifacts                                                  │
│  [attempt-1.md] [attempt-1.eval.json] (rendered inline)    │
└─────────────────────────────────────────────────────────────┘
```

### Components to create (`dashboard/src/components/workflows/`)
- `WorkflowRunCard.tsx` - List item card
- `WorkflowTimeline.tsx` - Event timeline (follow ActivityTimeline pattern)
- `WorkflowScoreCard.tsx` - Score visualization
- `WorkflowFilters.tsx` - Status/agent filters
- `StartWorkflowModal.tsx` - Agent picker + inputs form
- `ArtifactViewer.tsx` - Render markdown/JSON artifacts inline

---

## 7. Real-Time Updates

**Approach: Polling first, SSE later if needed**

Polling with adaptive intervals for MVP simplicity:

```typescript
// Detail page: poll every 2s while running
const interval = run?.status === 'running' ? 2000 : null;

// List page: poll every 5s if any running, else 30s
const hasRunning = runs.some(r => r.status === 'running');
const interval = hasRunning ? 5000 : 30000;
```

---

## 8. Execution Roadmap

### Phase 1: Foundation (MVP)

**PR 1: Data Model + Migration**
- Add `workflowRuns`, `workflowEvents`, `workflowArtifacts` tables to `dashboard/api/_lib/db/schema.ts`
- Run Drizzle migration
- Export types for use by runner

**PR 2: API Endpoints**
- Create `dashboard/api/workflows.ts` (list, get, create)
- Create `dashboard/api/workflow-events.ts`
- Create `dashboard/api/workflow-artifacts.ts`
- Create `dashboard/api/agents-config.ts`

**PR 3: LoopEngine Integration**
- Add `--workflow-id` CLI flag to `SYSTEM/orchestrator/loop-engine.ts`
- Import schema from `dashboard/api/_lib/db/schema.ts`
- Implement atomic job claiming
- Write events and artifacts directly to DB
- Update `heartbeatAt` every 30s
- Check `cancelRequestedAt` between stages

**PR 4: Basic UI - List Page**
- Add `/agents` route to `App.tsx`
- Add nav item to `Sidebar.tsx`
- Create `Agents.tsx` page with runs list
- Add API client methods
- Add polling for updates

### Phase 2: Detail View

**PR 5: Run Detail Page**
- Create `AgentRunDetail.tsx`
- Create `WorkflowTimeline.tsx`
- Wire up events API

**PR 6: Artifact Viewer**
- Create `ArtifactViewer.tsx` (render markdown/JSON)
- Wire up artifacts API
- Display inline on detail page

**PR 7: Start Workflow Modal**
- Create `StartWorkflowModal.tsx`
- Load agents from `/api/agents-config`
- POST to `/api/workflows`

### Phase 3: Actions

**PR 8: Cancel/Retry**
- Create `dashboard/api/workflow-cancel.ts`
- Create `dashboard/api/workflow-retry.ts`
- Add action buttons to detail page
- LoopEngine checks `cancelRequestedAt` and exits gracefully

**PR 9: Polish**
- Add filters to list page
- Add loading skeletons
- Add empty states
- Add stalled run warning (heartbeat > 2min old)

---

## 9. Critical Files

| Purpose | File |
|---------|------|
| **DB Schema (single source)** | `dashboard/api/_lib/db/schema.ts` |
| Workflow Engine | `SYSTEM/orchestrator/loop-engine.ts` |
| Agent Config | `SYSTEM/config/agents.yaml` |
| API Pattern | `dashboard/api/activities.ts` (copy structure) |
| Timeline Pattern | `dashboard/src/components/shared/ActivityTimeline.tsx` |
| Page Pattern | `dashboard/src/pages/Todos.tsx` |
| Routes | `dashboard/src/App.tsx` |
| Sidebar | `dashboard/src/components/layout/Sidebar.tsx` |
| Types | `dashboard/src/types/index.ts` |
| API Client | `dashboard/src/api/client.ts` |

---

## 10. Verification

After implementation, verify:

1. **API endpoints work:** Test with curl or `vercel dev`
   - `GET /api/agents-config` returns agents list
   - `POST /api/workflows` creates a queued run
   - `GET /api/workflows` lists runs

2. **LoopEngine claims and writes to DB:**
   ```bash
   npx ts-node SYSTEM/orchestrator/loop-engine.ts 2026-02-01-001 target_builder --workflow-id run_test123
   ```
   - Check `workflow_runs.claimedAt` is set
   - Check `workflow_events` has stage changes
   - Check `workflow_artifacts` has output content

3. **Double-claim prevention:**
   - Start two runners with same `--workflow-id`
   - Only one should claim and run

4. **UI updates in real-time:**
   - Start a workflow via CLI with `--workflow-id`
   - Watch the list/detail page update as stages progress

5. **Cancel works:**
   - Click Cancel in UI
   - Verify `cancelRequestedAt` is set
   - Runner exits gracefully at next stage boundary

6. **Artifacts display:**
   - View completed run detail page
   - Verify markdown/JSON renders inline
