# Agent Workflow UI - Codex Implementation Guide

This guide provides step-by-step instructions for implementing the Agent Workflow UI feature PR-by-PR. Each section is self-contained with exact file paths, code to add, and verification steps.

---

## Environment Setup

Before starting any PR, ensure you have:

```bash
# Required env vars (in .env or Vercel dashboard)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Local development
cd dashboard
npm install
npm run dev  # Starts Vite on :3000
```

---

## PR 1: Data Model + Migration

### Goal
Add three new database tables (`workflow_runs`, `workflow_events`, `workflow_artifacts`) to track workflow executions.

### Files to Modify

**`dashboard/api/_lib/db/schema.ts`** - Add after existing tables:

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ... existing tables (activities, reminders, etc.) ...

// Workflow Runs: Parent record for entire loop execution
export const workflowRuns = sqliteTable('workflow_runs', {
  id: text('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  cycleId: text('cycle_id').notNull(),
  status: text('status').notNull(), // 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
  currentStage: text('current_stage'),
  currentAttempt: integer('current_attempt').default(1),
  maxAttempts: integer('max_attempts').notNull(),
  passThreshold: real('pass_threshold').notNull(),
  finalScore: real('final_score'),
  errorMessage: text('error_message'),
  inputs: text('inputs'),
  claimedAt: text('claimed_at'),
  claimedBy: text('claimed_by'),
  heartbeatAt: text('heartbeat_at'),
  cancelRequestedAt: text('cancel_requested_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Workflow Events: Real-time event log for UI updates
export const workflowEvents = sqliteTable('workflow_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),
  eventType: text('event_type').notNull(), // 'stage_change' | 'log' | 'score_update' | 'error'
  stage: text('stage'),
  attempt: integer('attempt'),
  message: text('message'),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Workflow Artifacts: Store artifact content for UI display
export const workflowArtifacts = sqliteTable('workflow_artifacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull(),
  attempt: integer('attempt').notNull(),
  artifactType: text('artifact_type').notNull(), // 'output' | 'evaluation'
  filename: text('filename').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Export types
export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;
export type WorkflowEvent = typeof workflowEvents.$inferSelect;
export type NewWorkflowEvent = typeof workflowEvents.$inferInsert;
export type WorkflowArtifact = typeof workflowArtifacts.$inferSelect;
export type NewWorkflowArtifact = typeof workflowArtifacts.$inferInsert;

export type WorkflowStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
export type WorkflowStage = 'producing' | 'evaluating' | 'revising';
export type WorkflowEventType = 'stage_change' | 'log' | 'score_update' | 'error';
```

### Run Migration

```bash
cd dashboard
npx drizzle-kit generate
npx drizzle-kit push
```

### Acceptance Criteria
- [ ] Three new tables exist in Turso: `workflow_runs`, `workflow_events`, `workflow_artifacts`
- [ ] TypeScript types are exported and usable
- [ ] No errors when importing schema

### Test Commands

```bash
# Verify tables exist (use Turso CLI or drizzle-kit studio)
cd dashboard
npx drizzle-kit studio
# Open http://localhost:4983 and verify tables are visible
```

### Pitfalls
- **Drizzle migration**: If `drizzle-kit push` fails, check that `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- **Schema sync**: The schema in `dashboard/api/_lib/db/schema.ts` is the single source of truth - do NOT duplicate elsewhere

---

## PR 2: API Endpoints

### Goal
Create Vercel serverless functions to CRUD workflow data.

### Files to Create

**`dashboard/api/workflows.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowRuns } from './_lib/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

function generateRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateCycleId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${date}-${time}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }
  const url = getRequestUrl(req);

  // GET /api/workflows - List all or get single by id
  if (req.method === 'GET') {
    try {
      const id = url.searchParams.get('id');
      const status = url.searchParams.get('status');
      const agent = url.searchParams.get('agent');

      if (id) {
        // Get single run
        const results = await db
          .select()
          .from(workflowRuns)
          .where(eq(workflowRuns.id, id))
          .limit(1);

        if (results.length === 0) {
          res.status(404).json({ error: 'Workflow run not found' });
          return;
        }

        const run = results[0];
        res.status(200).json({
          ...run,
          inputs: run.inputs ? JSON.parse(run.inputs) : null,
        });
        return;
      }

      // List runs with optional filters
      let query = db.select().from(workflowRuns);
      const conditions = [];

      if (status) {
        conditions.push(eq(workflowRuns.status, status));
      }
      if (agent) {
        conditions.push(eq(workflowRuns.agentName, agent));
      }

      const results = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(workflowRuns.createdAt)).limit(50)
        : await query.orderBy(desc(workflowRuns.createdAt)).limit(50);

      const runs = results.map(run => ({
        ...run,
        inputs: run.inputs ? JSON.parse(run.inputs) : null,
      }));

      res.status(200).json(runs);
      return;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      res.status(500).json({ error: 'Failed to fetch workflows' });
      return;
    }
  }

  // POST /api/workflows - Create new workflow run
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { agentName, inputs, maxAttempts = 3, passThreshold = 0.85, cycleId } = body;

      if (!agentName) {
        res.status(400).json({ error: 'Missing required field: agentName' });
        return;
      }

      const id = generateRunId();
      const finalCycleId = cycleId || generateCycleId();

      const result = await db.insert(workflowRuns).values({
        id,
        agentName,
        cycleId: finalCycleId,
        status: 'queued',
        maxAttempts,
        passThreshold,
        inputs: inputs ? JSON.stringify(inputs) : null,
      }).returning();

      res.status(201).json({
        ...result[0],
        inputs: inputs || null,
      });
      return;
    } catch (error) {
      console.error('Error creating workflow:', error);
      res.status(500).json({ error: 'Failed to create workflow' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
```

**`dashboard/api/workflow-events.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowEvents } from './_lib/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }
  const url = getRequestUrl(req);

  // GET /api/workflow-events?runId=X
  if (req.method === 'GET') {
    try {
      const runId = url.searchParams.get('runId');

      if (!runId) {
        res.status(400).json({ error: 'Missing required param: runId' });
        return;
      }

      const results = await db
        .select()
        .from(workflowEvents)
        .where(eq(workflowEvents.runId, runId))
        .orderBy(desc(workflowEvents.createdAt));

      const events = results.map(event => ({
        ...event,
        metadata: event.metadata ? JSON.parse(event.metadata) : null,
      }));

      res.status(200).json(events);
      return;
    } catch (error) {
      console.error('Error fetching workflow events:', error);
      res.status(500).json({ error: 'Failed to fetch workflow events' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
```

**`dashboard/api/workflow-artifacts.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowArtifacts } from './_lib/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }
  const url = getRequestUrl(req);

  // GET /api/workflow-artifacts?runId=X
  if (req.method === 'GET') {
    try {
      const runId = url.searchParams.get('runId');

      if (!runId) {
        res.status(400).json({ error: 'Missing required param: runId' });
        return;
      }

      const results = await db
        .select()
        .from(workflowArtifacts)
        .where(eq(workflowArtifacts.runId, runId))
        .orderBy(desc(workflowArtifacts.createdAt));

      res.status(200).json(results);
      return;
    } catch (error) {
      console.error('Error fetching workflow artifacts:', error);
      res.status(500).json({ error: 'Failed to fetch workflow artifacts' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
```

**`dashboard/api/agents-config.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export const config = {
  runtime: 'nodejs',
};

interface AgentConfig {
  name: string;
  description: string;
  threshold: number;
  max_attempts: number;
  inputs: string[];
}

interface AgentsYaml {
  version: string;
  defaults: {
    pass_threshold: number;
    max_attempts: number;
  };
  agents: Record<string, AgentConfig>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // In production, fetch from GitHub raw
    // In development, read from filesystem
    const isProduction = process.env.VERCEL_ENV === 'production';

    let yamlContent: string;

    if (isProduction) {
      const response = await fetch(
        'https://raw.githubusercontent.com/FedeRojas18/growth-os/main/SYSTEM/config/agents.yaml'
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch agents.yaml: ${response.statusText}`);
      }
      yamlContent = await response.text();
    } else {
      const configPath = path.resolve(process.cwd(), '../SYSTEM/config/agents.yaml');
      yamlContent = fs.readFileSync(configPath, 'utf-8');
    }

    const config = yaml.parse(yamlContent) as AgentsYaml;

    // Transform to array format for UI
    const agents = Object.entries(config.agents).map(([key, agent]) => ({
      id: key,
      name: agent.name,
      description: agent.description,
      threshold: agent.threshold || config.defaults.pass_threshold,
      maxAttempts: agent.max_attempts || config.defaults.max_attempts,
      inputs: agent.inputs || [],
    }));

    res.status(200).json({
      version: config.version,
      agents,
    });
  } catch (error) {
    console.error('Error loading agents config:', error);
    res.status(500).json({ error: 'Failed to load agents configuration' });
  }
}
```

### Acceptance Criteria
- [ ] `GET /api/workflows` returns list of workflow runs
- [ ] `GET /api/workflows?id=X` returns single run
- [ ] `POST /api/workflows` creates new run with status 'queued'
- [ ] `GET /api/workflow-events?runId=X` returns events
- [ ] `GET /api/workflow-artifacts?runId=X` returns artifacts
- [ ] `GET /api/agents-config` returns agent list from YAML

### Test Commands

```bash
# Start Vercel dev server
cd dashboard
vercel dev

# Test endpoints
curl http://localhost:3000/api/agents-config | jq

curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"agentName": "target_builder", "inputs": {"thesis": "test"}}' | jq

curl http://localhost:3000/api/workflows | jq

curl "http://localhost:3000/api/workflows?id=run_xxx" | jq
```

### Pitfalls
- **YAML parsing**: Install `yaml` package: `npm install yaml`
- **File paths**: In production, agents.yaml must be fetched from GitHub raw URL
- **Runtime**: All endpoints must use `runtime: 'nodejs'` for Turso compatibility

---

## PR 3: LoopEngine Integration

### Goal
Modify the LoopEngine to write workflow status directly to Turso when `--workflow-id` is provided.

### Files to Modify

**`SYSTEM/orchestrator/loop-engine.ts`** - Add imports and workflow tracking:

```typescript
// Add at top of file
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, and, isNull } from 'drizzle-orm';
import { hostname } from 'os';

// Import schema from dashboard (single source of truth)
import {
  workflowRuns,
  workflowEvents,
  workflowArtifacts,
} from '../../dashboard/api/_lib/db/schema.js';
```

**Add workflow database connection helper:**

```typescript
function getWorkflowDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return null;
  }

  const client = createClient({ url, authToken });
  return drizzle(client);
}
```

**Add workflow ID to LoopEngine class:**

```typescript
class LoopEngine {
  private workflowId: string | null = null;
  private workflowDb: ReturnType<typeof getWorkflowDb> = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: LoopConfig, workflowId?: string) {
    // ... existing constructor code ...

    if (workflowId) {
      this.workflowId = workflowId;
      this.workflowDb = getWorkflowDb();
    }
  }
```

**Add atomic job claiming:**

```typescript
private async claimWorkflow(): Promise<boolean> {
  if (!this.workflowDb || !this.workflowId) return true; // No workflow tracking

  const result = await this.workflowDb
    .update(workflowRuns)
    .set({
      status: 'running',
      claimedAt: new Date().toISOString(),
      claimedBy: `${hostname()}:${process.pid}`,
      startedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(workflowRuns.id, this.workflowId),
        eq(workflowRuns.status, 'queued'),
        isNull(workflowRuns.claimedAt)
      )
    )
    .returning();

  return result.length > 0;
}
```

**Add event logging:**

```typescript
private async logWorkflowEvent(
  eventType: string,
  stage: string | null,
  attempt: number,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!this.workflowDb || !this.workflowId) return;

  await this.workflowDb.insert(workflowEvents).values({
    runId: this.workflowId,
    eventType,
    stage,
    attempt,
    message,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}
```

**Add artifact saving:**

```typescript
private async saveWorkflowArtifact(
  attempt: number,
  artifactType: 'output' | 'evaluation',
  filename: string,
  content: string
): Promise<void> {
  if (!this.workflowDb || !this.workflowId) return;

  await this.workflowDb.insert(workflowArtifacts).values({
    runId: this.workflowId,
    attempt,
    artifactType,
    filename,
    content,
  });
}
```

**Add heartbeat and cancel check:**

```typescript
private startHeartbeat(): void {
  if (!this.workflowDb || !this.workflowId) return;

  this.heartbeatInterval = setInterval(async () => {
    await this.workflowDb!
      .update(workflowRuns)
      .set({ heartbeatAt: new Date().toISOString() })
      .where(eq(workflowRuns.id, this.workflowId!));
  }, 30000); // Every 30 seconds
}

private stopHeartbeat(): void {
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }
}

private async checkCancelRequested(): Promise<boolean> {
  if (!this.workflowDb || !this.workflowId) return false;

  const result = await this.workflowDb
    .select({ cancelRequestedAt: workflowRuns.cancelRequestedAt })
    .from(workflowRuns)
    .where(eq(workflowRuns.id, this.workflowId))
    .limit(1);

  return result.length > 0 && result[0].cancelRequestedAt !== null;
}
```

**Modify runLoop() to use workflow tracking:**

```typescript
async runLoop(): Promise<LoopResult> {
  // Claim the workflow atomically
  if (this.workflowId) {
    const claimed = await this.claimWorkflow();
    if (!claimed) {
      console.log('Workflow already claimed by another runner');
      return { success: false, escalated: true, escalationReason: 'Already claimed' };
    }
    this.startHeartbeat();
    await this.logWorkflowEvent('stage_change', null, 0, 'Workflow started');
  }

  try {
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      // Check for cancellation between stages
      if (await this.checkCancelRequested()) {
        await this.handleCancellation();
        return { success: false, escalated: true, escalationReason: 'Cancelled by user' };
      }

      // Update current stage
      await this.updateWorkflowStage('producing', attempt);

      // ... existing produce logic ...
      const output = attempt === 1
        ? await this.runProducer(inputs)
        : await this.runReviser(lastOutput, lastEvaluation, attempt);

      // Save artifact
      await this.saveWorkflowArtifact(attempt, 'output', `attempt-${attempt}.md`, output);
      await this.logWorkflowEvent('stage_change', 'producing', attempt, 'Produced output');

      // Check for cancellation
      if (await this.checkCancelRequested()) {
        await this.handleCancellation();
        return { success: false, escalated: true, escalationReason: 'Cancelled by user' };
      }

      // Update current stage
      await this.updateWorkflowStage('evaluating', attempt);

      // ... existing evaluate logic ...
      const evaluation = await this.runEvaluator(output);

      // Save evaluation artifact
      await this.saveWorkflowArtifact(
        attempt,
        'evaluation',
        `attempt-${attempt}.eval.json`,
        JSON.stringify(evaluation, null, 2)
      );
      await this.logWorkflowEvent('score_update', 'evaluating', attempt, 'Evaluation complete', {
        score: evaluation.overallScore,
        passed: evaluation.passed,
        feedback: evaluation.feedback,
      });

      if (evaluation.passed && evaluation.overallScore >= this.config.passThreshold) {
        await this.completeWorkflow('passed', evaluation.overallScore);
        return { success: true, ... };
      }

      // Continue to revision...
    }

    // Failed all attempts
    await this.completeWorkflow('failed', lastEvaluation?.overallScore);
    return { success: false, escalated: true, ... };

  } finally {
    this.stopHeartbeat();
  }
}

private async updateWorkflowStage(stage: string, attempt: number): Promise<void> {
  if (!this.workflowDb || !this.workflowId) return;

  await this.workflowDb
    .update(workflowRuns)
    .set({
      currentStage: stage,
      currentAttempt: attempt,
      heartbeatAt: new Date().toISOString(),
    })
    .where(eq(workflowRuns.id, this.workflowId));
}

private async completeWorkflow(status: 'passed' | 'failed', finalScore?: number): Promise<void> {
  if (!this.workflowDb || !this.workflowId) return;

  await this.workflowDb
    .update(workflowRuns)
    .set({
      status,
      currentStage: null,
      finalScore: finalScore ?? null,
      completedAt: new Date().toISOString(),
    })
    .where(eq(workflowRuns.id, this.workflowId));

  await this.logWorkflowEvent('stage_change', null, 0, `Workflow ${status}`, { finalScore });
}

private async handleCancellation(): Promise<void> {
  if (!this.workflowDb || !this.workflowId) return;

  await this.workflowDb
    .update(workflowRuns)
    .set({
      status: 'cancelled',
      currentStage: null,
      completedAt: new Date().toISOString(),
    })
    .where(eq(workflowRuns.id, this.workflowId));

  await this.logWorkflowEvent('stage_change', null, 0, 'Workflow cancelled by user');
}
```

**Update CLI to accept --workflow-id:**

```typescript
// At bottom of file, in CLI section
if (require.main === module) {
  const args = process.argv.slice(2);
  const cycleId = args[0];
  const agentName = args[1];

  // Parse --workflow-id flag
  const workflowIdIndex = args.indexOf('--workflow-id');
  const workflowId = workflowIdIndex !== -1 ? args[workflowIdIndex + 1] : undefined;

  const engine = createLoopEngine(cycleId, agentName, {}, 'WORK/runs', workflowId);
  engine.runLoop().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}
```

### Acceptance Criteria
- [ ] Running with `--workflow-id` claims the job atomically
- [ ] Events are logged to `workflow_events` table
- [ ] Artifacts are saved to `workflow_artifacts` table
- [ ] Heartbeat updates every 30s
- [ ] Cancellation is checked between stages
- [ ] Running without `--workflow-id` works as before (backward compat)

### Test Commands

```bash
# First create a workflow via API
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"agentName": "target_builder"}' | jq
# Note the id, e.g., "run_abc123"

# Run with workflow tracking
cd /path/to/growth-os
TURSO_DATABASE_URL=xxx TURSO_AUTH_TOKEN=xxx \
npx ts-node SYSTEM/orchestrator/loop-engine.ts 2026-02-01-001 target_builder --workflow-id run_abc123

# Check events were logged
curl "http://localhost:3000/api/workflow-events?runId=run_abc123" | jq

# Check artifacts were saved
curl "http://localhost:3000/api/workflow-artifacts?runId=run_abc123" | jq
```

### Pitfalls
- **Import paths**: Use relative imports from SYSTEM to dashboard schema
- **Env vars**: Runner needs `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in environment
- **Backward compat**: All workflow tracking should be conditional on `workflowId` being provided

---

## PR 4: Basic UI - List Page

### Goal
Add `/agents` route with a list of workflow runs.

### Files to Create/Modify

**`dashboard/src/pages/Agents.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import type { WorkflowRun } from '../types';

const STATUS_BADGES: Record<string, { variant: string; label: string }> = {
  queued: { variant: 'slate', label: 'Queued' },
  running: { variant: 'blue', label: 'Running' },
  passed: { variant: 'emerald', label: 'Passed' },
  failed: { variant: 'red', label: 'Failed' },
  cancelled: { variant: 'amber', label: 'Cancelled' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function Agents() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const data = await api.getWorkflows();
      setRuns(data);
      setError(null);
    } catch (err) {
      setError('Failed to load workflow runs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();

    // Poll for updates
    const hasRunning = runs.some(r => r.status === 'running' || r.status === 'queued');
    const interval = hasRunning ? 5000 : 30000;
    const timer = setInterval(fetchRuns, interval);

    return () => clearInterval(timer);
  }, [fetchRuns, runs]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Agent Workflows</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and control automated workflows</p>
        </div>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={() => {/* TODO: Open start modal */}}
        >
          + Start Workflow
        </button>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          title="No workflow runs"
          description="Start a workflow to see it here"
        />
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const statusInfo = STATUS_BADGES[run.status] || STATUS_BADGES.queued;
            return (
              <Link key={run.id} to={`/agents/${run.id}`}>
                <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-gray-900">{run.agentName}</div>
                        <div className="text-xs text-gray-500">{run.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={statusInfo.variant as any}>
                        {statusInfo.label}
                        {run.status === 'running' && run.currentAttempt && (
                          <span className="ml-1">({run.currentAttempt}/{run.maxAttempts})</span>
                        )}
                      </Badge>
                      {run.finalScore !== null && (
                        <span className="text-sm text-gray-600">
                          Score: {(run.finalScore * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(run.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**`dashboard/src/types/index.ts`** - Add workflow types:

```typescript
// ... existing types ...

export interface WorkflowRun {
  id: string;
  agentName: string;
  cycleId: string;
  status: 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';
  currentStage: string | null;
  currentAttempt: number | null;
  maxAttempts: number;
  passThreshold: number;
  finalScore: number | null;
  errorMessage: string | null;
  inputs: Record<string, unknown> | null;
  claimedAt: string | null;
  claimedBy: string | null;
  heartbeatAt: string | null;
  cancelRequestedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface WorkflowEvent {
  id: number;
  runId: string;
  eventType: string;
  stage: string | null;
  attempt: number | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface WorkflowArtifact {
  id: number;
  runId: string;
  attempt: number;
  artifactType: 'output' | 'evaluation';
  filename: string;
  content: string;
  createdAt: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  threshold: number;
  maxAttempts: number;
  inputs: string[];
}
```

**`dashboard/src/api/client.ts`** - Add workflow API methods:

```typescript
// ... existing code ...

// Workflow API
getWorkflows: (params?: { status?: string; agent?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.agent) query.set('agent', params.agent);
  const queryStr = query.toString();
  return fetchJson<WorkflowRun[]>(`/workflows${queryStr ? `?${queryStr}` : ''}`);
},

getWorkflow: (id: string) => fetchJson<WorkflowRun>(`/workflows?id=${id}`),

createWorkflow: (data: { agentName: string; inputs?: Record<string, unknown> }) =>
  postJson<WorkflowRun>('/workflows', data),

getWorkflowEvents: (runId: string) =>
  fetchJson<WorkflowEvent[]>(`/workflow-events?runId=${runId}`),

getWorkflowArtifacts: (runId: string) =>
  fetchJson<WorkflowArtifact[]>(`/workflow-artifacts?runId=${runId}`),

getAgentsConfig: () => fetchJson<{ version: string; agents: AgentConfig[] }>('/agents-config'),
```

**`dashboard/src/App.tsx`** - Add route:

```typescript
import { Agents } from './pages/Agents';

// In Routes:
<Route path="agents" element={<Agents />} />
```

**`dashboard/src/components/layout/Sidebar.tsx`** - Add nav item:

```typescript
const navItems = [
  // ... existing items ...
  { path: '/agents', label: 'Agents', icon: '🤖' },
];
```

### Acceptance Criteria
- [ ] `/agents` page shows list of workflow runs
- [ ] Each run shows agent name, status badge, score (if completed), time ago
- [ ] Clicking a run navigates to `/agents/:runId`
- [ ] List polls every 5s if running workflows exist, 30s otherwise
- [ ] Empty state shown when no runs exist
- [ ] Sidebar has "Agents" nav item

### Test Commands

```bash
cd dashboard
npm run dev

# Open http://localhost:3000/agents
# Create a test workflow via API to see it in the list
```

### Pitfalls
- **Polling interval**: Use conditional interval based on whether any workflows are running
- **Type imports**: Import `WorkflowRun` from types file

---

## PR 5: Run Detail Page

### Goal
Create detail page showing workflow timeline and status.

### Files to Create

**`dashboard/src/pages/AgentRunDetail.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Skeleton } from '../components/shared/Skeleton';
import { WorkflowTimeline } from '../components/workflows/WorkflowTimeline';
import type { WorkflowRun, WorkflowEvent } from '../types';

export function AgentRunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!runId) return;

    try {
      const [runData, eventsData] = await Promise.all([
        api.getWorkflow(runId),
        api.getWorkflowEvents(runId),
      ]);
      setRun(runData);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError('Failed to load workflow details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchData();

    // Poll while running
    if (run?.status === 'running' || run?.status === 'queued') {
      const timer = setInterval(fetchData, 2000);
      return () => clearInterval(timer);
    }
  }, [fetchData, run?.status]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Workflow not found'}</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    queued: 'slate',
    running: 'blue',
    passed: 'emerald',
    failed: 'red',
    cancelled: 'amber',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/agents')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Back to Workflows
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{run.agentName}</h1>
          <p className="text-sm text-gray-500">{run.id} • Cycle: {run.cycleId}</p>
        </div>
        <div className="flex gap-2">
          {(run.status === 'failed' || run.status === 'cancelled') && (
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Retry
            </button>
          )}
          {(run.status === 'running' || run.status === 'queued') && (
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <div className="p-4 flex items-center gap-6">
          <Badge variant={statusColors[run.status] as any}>
            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
          </Badge>
          {run.currentAttempt && (
            <span className="text-sm text-gray-600">
              Attempt {run.currentAttempt}/{run.maxAttempts}
            </span>
          )}
          {run.currentStage && (
            <span className="text-sm text-gray-600">
              Stage: {run.currentStage}
            </span>
          )}
          {run.finalScore !== null && (
            <span className="text-sm font-medium">
              Score: {(run.finalScore * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Timeline</h2>
        </div>
        <div className="p-4">
          <WorkflowTimeline events={events} currentStage={run.currentStage} />
        </div>
      </Card>

      {/* Inputs */}
      {run.inputs && (
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Inputs</h2>
          </div>
          <div className="p-4">
            <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(run.inputs, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
```

**`dashboard/src/components/workflows/WorkflowTimeline.tsx`**

```typescript
import type { WorkflowEvent } from '../../types';

interface Props {
  events: WorkflowEvent[];
  currentStage: string | null;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString();
}

const EVENT_ICONS: Record<string, string> = {
  stage_change: '●',
  score_update: '◆',
  log: '○',
  error: '✗',
};

export function WorkflowTimeline({ events, currentStage }: Props) {
  if (events.length === 0 && !currentStage) {
    return <p className="text-sm text-gray-500">No events yet</p>;
  }

  // Sort events oldest first for timeline display
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <div key={event.id} className="flex items-start gap-3">
          <span className="text-indigo-600 mt-0.5">
            {EVENT_ICONS[event.eventType] || '○'}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {formatTime(event.createdAt)}
              </span>
              {event.stage && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {event.stage}
                </span>
              )}
              {event.attempt && (
                <span className="text-xs text-gray-500">
                  Attempt {event.attempt}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{event.message}</p>
            {event.metadata && (
              <div className="text-xs text-gray-500 mt-1">
                {event.metadata.score !== undefined && (
                  <span>Score: {((event.metadata.score as number) * 100).toFixed(1)}%</span>
                )}
                {event.metadata.feedback && (
                  <p className="mt-1 italic">"{event.metadata.feedback}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Show current stage as in-progress */}
      {currentStage && (
        <div className="flex items-start gap-3">
          <span className="text-blue-500 mt-0.5 animate-pulse">○</span>
          <div>
            <span className="text-sm text-gray-700">
              {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}...
            </span>
            <span className="text-xs text-gray-400 ml-2">(in progress)</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**`dashboard/src/App.tsx`** - Add route:

```typescript
import { AgentRunDetail } from './pages/AgentRunDetail';

// In Routes:
<Route path="agents/:runId" element={<AgentRunDetail />} />
```

### Acceptance Criteria
- [ ] `/agents/:runId` shows workflow details
- [ ] Status badge, attempt count, and score displayed
- [ ] Timeline shows all events in chronological order
- [ ] Current stage shown as "in progress" with animation
- [ ] Inputs displayed if present
- [ ] Page polls every 2s while workflow is running

### Test Commands

```bash
cd dashboard
npm run dev

# Navigate to /agents, click on a run
# Or directly go to /agents/run_xxx
```

---

## PR 6: Artifact Viewer

### Goal
Display workflow artifacts (markdown/JSON) inline on detail page.

### Files to Create/Modify

**`dashboard/src/components/workflows/ArtifactViewer.tsx`**

```typescript
import { useState } from 'react';
import type { WorkflowArtifact } from '../../types';

interface Props {
  artifacts: WorkflowArtifact[];
}

export function ArtifactViewer({ artifacts }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );

  if (artifacts.length === 0) {
    return <p className="text-sm text-gray-500">No artifacts yet</p>;
  }

  const selected = artifacts.find((a) => a.id === selectedId);

  // Group by attempt
  const byAttempt = artifacts.reduce((acc, artifact) => {
    if (!acc[artifact.attempt]) {
      acc[artifact.attempt] = [];
    }
    acc[artifact.attempt].push(artifact);
    return acc;
  }, {} as Record<number, WorkflowArtifact[]>);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(byAttempt).map(([attempt, arts]) => (
          <div key={attempt} className="flex gap-1">
            {arts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelectedId(artifact.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedId === artifact.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {artifact.filename}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      {selected && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {selected.filename}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              Attempt {selected.attempt}
            </span>
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            {selected.filename.endsWith('.json') ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selected.content), null, 2);
                  } catch {
                    return selected.content;
                  }
                })()}
              </pre>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {selected.content}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**`dashboard/src/pages/AgentRunDetail.tsx`** - Add artifacts section:

```typescript
import { ArtifactViewer } from '../components/workflows/ArtifactViewer';
import type { WorkflowArtifact } from '../types';

// In component:
const [artifacts, setArtifacts] = useState<WorkflowArtifact[]>([]);

// In fetchData:
const [runData, eventsData, artifactsData] = await Promise.all([
  api.getWorkflow(runId),
  api.getWorkflowEvents(runId),
  api.getWorkflowArtifacts(runId),
]);
setArtifacts(artifactsData);

// In JSX, add after Inputs card:
{artifacts.length > 0 && (
  <Card>
    <div className="p-4 border-b border-gray-100">
      <h2 className="font-medium text-gray-900">Artifacts</h2>
    </div>
    <div className="p-4">
      <ArtifactViewer artifacts={artifacts} />
    </div>
  </Card>
)}
```

### Acceptance Criteria
- [ ] Artifacts section shows on detail page when artifacts exist
- [ ] Tabs allow switching between artifacts
- [ ] JSON artifacts are pretty-printed
- [ ] Markdown artifacts are displayed as preformatted text
- [ ] Scroll for long content

---

## PR 7: Start Workflow Modal

### Goal
Add modal to start new workflows from the UI.

### Files to Create

**`dashboard/src/components/workflows/StartWorkflowModal.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { AgentConfig } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (runId: string) => void;
}

export function StartWorkflowModal({ isOpen, onClose, onCreated }: Props) {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getAgentsConfig().then((data) => {
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgent(data.agents[0].id);
        }
      });
    }
  }, [isOpen]);

  const selectedAgentConfig = agents.find((a) => a.id === selectedAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.createWorkflow({
        agentName: selectedAgent,
        inputs: Object.keys(inputs).length > 0 ? inputs : undefined,
      });
      onCreated(result.id);
      onClose();
    } catch (err) {
      setError('Failed to create workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Start Workflow</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                setInputs({});
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {selectedAgentConfig && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedAgentConfig.description}
              </p>
            )}
          </div>

          {/* Input Fields */}
          {selectedAgentConfig?.inputs.map((inputName) => (
            <div key={inputName}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputName}
              </label>
              <input
                type="text"
                value={inputs[inputName] || ''}
                onChange={(e) =>
                  setInputs({ ...inputs, [inputName]: e.target.value })
                }
                placeholder={`Enter ${inputName}...`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAgent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Start Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**`dashboard/src/pages/Agents.tsx`** - Wire up modal:

```typescript
import { StartWorkflowModal } from '../components/workflows/StartWorkflowModal';
import { useNavigate } from 'react-router-dom';

// In component:
const navigate = useNavigate();
const [showStartModal, setShowStartModal] = useState(false);

// Update button:
<button
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
  onClick={() => setShowStartModal(true)}
>
  + Start Workflow
</button>

// Add modal at end of component:
<StartWorkflowModal
  isOpen={showStartModal}
  onClose={() => setShowStartModal(false)}
  onCreated={(runId) => {
    navigate(`/agents/${runId}`);
  }}
/>
```

### Acceptance Criteria
- [ ] "+ Start Workflow" button opens modal
- [ ] Modal shows agent dropdown loaded from API
- [ ] Input fields shown based on selected agent's inputs
- [ ] Creating workflow navigates to detail page
- [ ] Modal can be closed with Cancel button

---

## PR 8: Cancel/Retry

### Goal
Add cancel and retry functionality.

### Files to Create

**`dashboard/api/workflow-cancel.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowRuns } from './_lib/db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }

  const url = getRequestUrl(req);
  const id = url.searchParams.get('id');

  if (!id) {
    res.status(400).json({ error: 'Missing required param: id' });
    return;
  }

  try {
    const result = await db
      .update(workflowRuns)
      .set({ cancelRequestedAt: new Date().toISOString() })
      .where(
        and(
          eq(workflowRuns.id, id),
          inArray(workflowRuns.status, ['queued', 'running'])
        )
      )
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Workflow not found or not cancellable' });
      return;
    }

    res.status(200).json({ success: true, cancelRequestedAt: result[0].cancelRequestedAt });
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    res.status(500).json({ error: 'Failed to cancel workflow' });
  }
}
```

**`dashboard/api/workflow-retry.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { workflowRuns } from './_lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

function generateRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateCycleId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${date}-${time}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }

  const url = getRequestUrl(req);
  const id = url.searchParams.get('id');

  if (!id) {
    res.status(400).json({ error: 'Missing required param: id' });
    return;
  }

  try {
    // Fetch original run
    const original = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, id))
      .limit(1);

    if (original.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    const orig = original[0];

    // Create new run with same config
    const newId = generateRunId();
    const result = await db.insert(workflowRuns).values({
      id: newId,
      agentName: orig.agentName,
      cycleId: generateCycleId(),
      status: 'queued',
      maxAttempts: orig.maxAttempts,
      passThreshold: orig.passThreshold,
      inputs: orig.inputs,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error retrying workflow:', error);
    res.status(500).json({ error: 'Failed to retry workflow' });
  }
}
```

**`dashboard/src/api/client.ts`** - Add methods:

```typescript
cancelWorkflow: (id: string) => postJson<{ success: boolean }>(`/workflow-cancel?id=${id}`, {}),

retryWorkflow: (id: string) => postJson<WorkflowRun>(`/workflow-retry?id=${id}`, {}),
```

**`dashboard/src/pages/AgentRunDetail.tsx`** - Wire up buttons:

```typescript
const handleCancel = async () => {
  if (!run) return;
  try {
    await api.cancelWorkflow(run.id);
    fetchData();
  } catch (err) {
    console.error('Failed to cancel:', err);
  }
};

const handleRetry = async () => {
  if (!run) return;
  try {
    const newRun = await api.retryWorkflow(run.id);
    navigate(`/agents/${newRun.id}`);
  } catch (err) {
    console.error('Failed to retry:', err);
  }
};

// Update buttons:
<button onClick={handleRetry} className="...">Retry</button>
<button onClick={handleCancel} className="...">Cancel</button>
```

### Acceptance Criteria
- [ ] Cancel button sets `cancelRequestedAt` in DB
- [ ] Retry button creates new run and navigates to it
- [ ] Buttons only shown for appropriate statuses

---

## PR 9: Polish

### Goal
Add filters, loading states, empty states, and stalled warning.

### Files to Modify

**`dashboard/src/pages/Agents.tsx`** - Add filters:

```typescript
const [statusFilter, setStatusFilter] = useState<string>('');
const [agentFilter, setAgentFilter] = useState<string>('');

// In fetchRuns:
const data = await api.getWorkflows({
  status: statusFilter || undefined,
  agent: agentFilter || undefined,
});

// Add filter UI after the header:
<div className="flex gap-4">
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
  >
    <option value="">All Statuses</option>
    <option value="queued">Queued</option>
    <option value="running">Running</option>
    <option value="passed">Passed</option>
    <option value="failed">Failed</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>
```

**Stalled warning** - Add to `AgentRunDetail.tsx`:

```typescript
const isStalled = run.status === 'running' && run.heartbeatAt &&
  new Date().getTime() - new Date(run.heartbeatAt).getTime() > 2 * 60 * 1000;

// In status card:
{isStalled && (
  <span className="text-amber-600 text-sm">
    ⚠️ Runner may be stalled (no heartbeat for 2+ minutes)
  </span>
)}
```

### Acceptance Criteria
- [ ] Status filter dropdown works
- [ ] Stalled warning shown when heartbeat is old
- [ ] Loading skeletons shown during fetch
- [ ] Empty state shown when no runs match filters

---

## Summary Checklist

| PR | Description | Key Files |
|----|-------------|-----------|
| 1 | Data Model | `dashboard/api/_lib/db/schema.ts` |
| 2 | API Endpoints | `dashboard/api/workflows.ts`, `workflow-events.ts`, `workflow-artifacts.ts`, `agents-config.ts` |
| 3 | LoopEngine | `SYSTEM/orchestrator/loop-engine.ts` |
| 4 | List Page | `dashboard/src/pages/Agents.tsx` |
| 5 | Detail Page | `dashboard/src/pages/AgentRunDetail.tsx`, `WorkflowTimeline.tsx` |
| 6 | Artifacts | `ArtifactViewer.tsx` |
| 7 | Start Modal | `StartWorkflowModal.tsx` |
| 8 | Cancel/Retry | `workflow-cancel.ts`, `workflow-retry.ts` |
| 9 | Polish | Filters, skeletons, stalled warning |
