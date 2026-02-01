# Stage 01: Medium — Multi-Agent + Cycle Tracking

> **Goal:** Extend MVP loop engine to multiple agents with proper cycle tracking.
> **Builds on:** 00-mvp (loop engine, run logging, rubric format)
> **Outcome:** Full pipeline can run with autonomous loops for each agent.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        MEDIUM: MULTI-AGENT PIPELINE                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           CYCLE MANAGER                                            │ │
│  │                   (Tracks cycle state + agent ordering)                            │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                         │                                               │
│         ┌───────────────────────────────┼───────────────────────────────┐              │
│         ▼                               ▼                               ▼              │
│  ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐       │
│  │   SIGNAL    │────────────────▶│   THESIS    │────────────────▶│   TARGET    │       │
│  │  SCANNER    │                 │  SELECTOR   │                 │  BUILDER    │       │
│  │   Loop      │                 │   Loop      │                 │   Loop      │       │
│  └─────────────┘                 └─────────────┘                 └─────────────┘       │
│         │                               │                               │              │
│         ▼                               ▼                               ▼              │
│  ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐       │
│  │  Evaluator  │                 │  Evaluator  │                 │  Evaluator  │       │
│  │  + Reviser  │                 │  + Reviser  │                 │  + Reviser  │       │
│  └─────────────┘                 └─────────────┘                 └─────────────┘       │
│                                                                         │              │
│                                                                         ▼              │
│                                  ┌─────────────┐                 ┌─────────────┐       │
│                                  │  MESSAGING  │◀────────────────│   TARGET    │       │
│                                  │   DRAFTER   │                 │   OUTPUT    │       │
│                                  │    Loop     │                 └─────────────┘       │
│                                  └─────────────┘                                       │
│                                         │                                               │
│                                         ▼                                               │
│                                  ┌─────────────┐       ┌─────────────┐                 │
│                                  │   EXPORT    │──────▶│  DASHBOARD  │                 │
│                                  │   AGENT     │       │    SYNC     │                 │
│                                  │(Deterministic)      │(Deterministic)               │
│                                  └─────────────┘       └─────────────┘                 │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              RUN LEDGER                                            │ │
│  │         (agent_runs + cycles tables + file artifacts)                              │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent List (Medium)

| Agent | Type | New in Medium? | Purpose |
|-------|------|----------------|---------|
| Target Builder | Producer | No (from MVP) | Generate target list |
| Target Evaluator | Evaluator | No (from MVP) | Score target list |
| Target Reviser | Reviser | No (from MVP) | Fix target issues |
| Signal Scanner | Producer | **YES** | Scan for ecosystem signals |
| Signal Evaluator | Evaluator | **YES** | Score signal quality |
| Signal Reviser | Reviser | **YES** | Reclassify/enrich signals |
| Thesis Selector | Producer | **YES** | Rank and select thesis |
| Thesis Evaluator | Evaluator | **YES** | Validate thesis viability |
| Thesis Reviser | Reviser | **YES** | Expand/adjust thesis |
| Messaging Drafter | Producer | **YES** | Generate outreach messages |
| Message Evaluator | Evaluator | **YES** | Validate message quality |
| Message Reviser | Reviser | **YES** | Rewrite failing messages |
| Export Agent | Deterministic | **YES** | Transform to CSV |
| Dashboard Sync | Deterministic | **YES** | Update dashboard |

---

## Trigger Graph (DAG)

```
                    ┌──────────────────┐
                    │   CYCLE START    │
                    │ (manual or cron) │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Signal Scanner  │
                    │      Loop        │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        [thesis_      [trigger_      [partner_
         candidate]    target]        lead]
              │              │              │
              ▼              │              ▼
    ┌──────────────────┐    │     ┌──────────────────┐
    │ Thesis Selector  │    │     │  Partner Agent   │
    │      Loop        │    │     │     Loop         │
    └────────┬─────────┘    │     └──────────────────┘
             │              │         (parallel path)
             ▼              │
    ┌──────────────────┐    │
    │  Target Builder  │◀───┘
    │      Loop        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Messaging Drafter│
    │      Loop        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Export Agent   │
    │  (Deterministic) │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Dashboard Sync  │
    │  (Deterministic) │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   CYCLE END      │
    │ (status: complete)│
    └──────────────────┘
```

---

## State Transitions (Cycle Level)

| State | Description | Next States |
|-------|-------------|-------------|
| `initialized` | Cycle created | `scanning` |
| `scanning` | Signal Scanner loop | `thesis_selecting`, `target_building`, `partner_researching` |
| `thesis_selecting` | Thesis Selector loop | `target_building` |
| `target_building` | Target Builder loop | `messaging` |
| `messaging` | Messaging Drafter loop | `exporting` |
| `exporting` | Export Agent running | `syncing` |
| `syncing` | Dashboard Sync running | `complete` |
| `complete` | Cycle finished | (terminal) |
| `failed` | Unrecoverable error | (terminal) |
| `paused` | Awaiting human input | Any prior state |

---

## Stop Conditions + Scoring Thresholds (All Agents)

### Signal Scanner

| Dimension | Weight | Threshold |
|-----------|--------|-----------|
| signal_recency | 0.20 | < 7 days |
| company_identified | 0.25 | Specific company named |
| trigger_match | 0.25 | Matches trigger library |
| bu_fit | 0.15 | Clear BU assignment |
| action_mapping | 0.15 | Clear next action |

**Threshold:** 0.85 | **Max Attempts:** 2

### Thesis Selector

| Dimension | Weight | Threshold |
|-----------|--------|-----------|
| signal_density | 0.30 | >= 3 companies |
| trigger_strength | 0.25 | Clear "why now" |
| bu_priority | 0.20 | Primary BU match |
| buyer_clarity | 0.15 | Titles identifiable |
| research_effort | 0.10 | Publicly available |

**Threshold:** 0.80 + margin >= 0.15 | **Max Attempts:** 2

### Target Builder

(Same as MVP - see 00-mvp)

**Threshold:** 0.85 | **Max Attempts:** 3

### Messaging Drafter

| Dimension | Weight | Threshold |
|-----------|--------|-----------|
| length_compliance | 0.20 | Under limit |
| trigger_reference | 0.25 | Specific + dated |
| pain_to_product | 0.25 | Clear connection |
| banned_phrases | 0.15 | Zero violations |
| cta_clarity | 0.15 | Specific action |

**Threshold:** 0.85 | **Max Attempts:** 3

---

## Files/Artifacts After Completion (Delta from MVP)

### New Files

```
SYSTEM/
├── rubrics/
│   ├── target-quality.yaml          # FROM MVP
│   ├── signal-quality.yaml          # NEW
│   ├── thesis-viability.yaml        # NEW
│   └── message-quality.yaml         # NEW
├── prompts/
│   ├── producers/
│   │   ├── target-builder.md        # FROM MVP
│   │   ├── signal-scanner.md        # NEW
│   │   ├── thesis-selector.md       # NEW
│   │   └── messaging-drafter.md     # NEW
│   ├── evaluators/
│   │   ├── target-builder-evaluator.md  # FROM MVP
│   │   ├── signal-scanner-evaluator.md  # NEW
│   │   ├── thesis-selector-evaluator.md # NEW
│   │   └── messaging-drafter-evaluator.md # NEW
│   └── revisers/
│       ├── target-builder-reviser.md    # FROM MVP
│       ├── signal-scanner-reviser.md    # NEW
│       ├── thesis-selector-reviser.md   # NEW
│       └── messaging-drafter-reviser.md # NEW
├── orchestrator/
│   ├── loop-engine.ts               # FROM MVP
│   └── cycle-manager.ts             # NEW
└── config/
    ├── agents.yaml                  # MODIFIED (add new agents)
    └── pipeline.yaml                # NEW (DAG definition)
```

---

## DB Schema Changes (Medium Delta)

Add `cycles` table:

```typescript
export const cycles = sqliteTable('cycles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: text('cycle_id').notNull().unique(),
  status: text('status').notNull(),
  currentState: text('current_state').notNull(),

  // Cycle metadata
  thesis: text('thesis'),
  signalDigestPath: text('signal_digest_path'),
  targetCount: integer('target_count'),
  buDistribution: text('bu_distribution'), // JSON

  // Timing
  initiatedAt: text('initiated_at').notNull(),
  completedAt: text('completed_at'),

  // Stats
  totalRuns: integer('total_runs').default(0),
  passedRuns: integer('passed_runs').default(0),
  failedRuns: integer('failed_runs').default(0),
});
```

Modify `agent_runs` to add FK:

```typescript
// Add to existing agent_runs table
cycleId: text('cycle_id').notNull().references(() => cycles.cycleId),
```

---

## API Endpoints (Medium)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cycles` | GET | List all cycles |
| `/api/cycles/:id` | GET | Get cycle details + runs |
| `/api/cycles` | POST | Start new cycle |
| `/api/cycles/:id/pause` | POST | Pause cycle |
| `/api/cycles/:id/resume` | POST | Resume cycle |
| `/api/agent-runs` | GET | List runs (filterable) |
| `/api/agent-runs/:id` | GET | Get run details |

---

## Acceptance Tests (Medium)

### Test 1: Full Pipeline Run

```bash
npm run cycle:start -- --thesis "LATAM Fintech Series A"
```

Expected:
- Cycle created with `initialized` status
- All agents run in sequence
- Cycle ends with `complete` status
- Artifacts in `WORK/runs/{cycle-id}/`

### Test 2: Multi-Agent Logging

```bash
sqlite3 dashboard/local.db "SELECT agent_name, COUNT(*) FROM agent_runs GROUP BY agent_name;"
```

Expected: Runs logged for all 4 looped agents.

### Test 3: Cycle State Transitions

```bash
sqlite3 dashboard/local.db "SELECT current_state FROM cycles WHERE cycle_id = 'test-cycle';"
```

Expected: State progresses through all stages.

### Test 4: Adding a New Agent

Add `partner_agent` following core conventions.

Expected: Only need rubric + prompts + config entry.

---

## What Medium Does NOT Include

- No escalation queue UI
- No real-time observability
- No human approval workflow
- No webhooks/triggers
- No parallel agent execution

These are added in Hard stage.
