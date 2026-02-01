# Stage 02: Hard — Full Orchestrator + Escalation UI + Observability

> **Goal:** Complete autonomous system with human escalation, real-time observability, and production hardening.
> **Builds on:** 01-medium (multi-agent, cycle tracking)
> **Outcome:** A true "company of agents" that runs with minimal supervision.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HARD: AUTONOMOUS GROWTH MACHINE                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                    CONTROL PLANE                                                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │   State    │  │    DAG     │  │  Retry/    │  │ Escalation │  │Observability│             │   │
│  │  │  Machine   │  │ Controller │  │  Backoff   │  │   Router   │  │   (MELT)   │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘              │   │
│  └────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                              │                                                         │
│                    ┌─────────────────────────┼─────────────────────────┐                              │
│                    ▼                         ▼                         ▼                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    AGENT LOOPS                                                 │    │
│  │                                                                                               │    │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │    │
│  │  │   Signal    │──▶│   Thesis    │──▶│   Target    │──▶│  Messaging  │──▶│   Export    │    │    │
│  │  │  Scanner    │   │  Selector   │   │  Builder    │   │  Drafter    │   │   Agent     │    │    │
│  │  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘    │    │
│  │         │                 │                 │                 │                 │           │    │
│  │  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐         │           │    │
│  │  │ Eval+Revise │   │ Eval+Revise │   │ Eval+Revise │   │ Eval+Revise │         │           │    │
│  │  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘         │           │    │
│  │                                                                                 ▼           │    │
│  │  ┌─────────────┐   ┌─────────────┐                                      ┌─────────────┐    │    │
│  │  │   Partner   │   │  Insights   │─────────────────────────────────────▶│  Dashboard  │    │    │
│  │  │   Agent     │   │   Agent     │                                      │    Sync     │    │    │
│  │  └──────┬──────┘   └──────┬──────┘                                      └─────────────┘    │    │
│  │         │                 │                                                                 │    │
│  │  ┌──────▼──────┐   ┌──────▼──────┐                                                         │    │
│  │  │ Eval+Revise │   │ Eval+Revise │                                                         │    │
│  │  └─────────────┘   └─────────────┘                                                         │    │
│  │                                                                                             │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                              │                                                         │
│                                              ▼                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              HUMAN ESCALATION LAYER                                             │   │
│  │                                                                                                 │   │
│  │  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐                           │   │
│  │  │  Escalation      │   │  Review Queue    │   │  Resolution      │                           │   │
│  │  │  Detection       │   │  (Dashboard UI)  │   │  Workflow        │                           │   │
│  │  └──────────────────┘   └──────────────────┘   └──────────────────┘                           │   │
│  │                                                                                                 │   │
│  │  Escalation Conditions:                                                                         │   │
│  │  • confidence < 0.85 after max attempts                                                        │   │
│  │  • high-risk conditions (competitor, exec-level, existing customer)                            │   │
│  │  • anomaly detection (velocity deviation > 2 std dev)                                          │   │
│  │  • explicit ambiguity flags                                                                    │   │
│  │                                                                                                 │   │
│  │  Categories: [URGENT] [REVIEW] [FYI]                                                           │   │
│  └────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                 OBSERVABILITY LAYER                                             │   │
│  │                                                                                                 │   │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │   │
│  │  │   Metrics    │   │    Logs      │   │   Traces     │   │   Alerts     │                    │   │
│  │  │  Dashboard   │   │  Aggregation │   │  Per-Cycle   │   │  Webhooks    │                    │   │
│  │  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘                    │   │
│  │                                                                                                 │   │
│  └────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                   LEARNING LAYER                                                │   │
│  │                                                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │  │ SYSTEM/playbooks│  │ SYSTEM/rubrics/ │  │ SYSTEM/prompts/ │  │SYSTEM/examples/ │           │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘           │   │
│  │                                                                                                 │   │
│  └────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent List (Complete)

| Agent | Type | Purpose |
|-------|------|---------|
| Signal Scanner | Producer + Loop | Scan sources for signals |
| Thesis Selector | Producer + Loop | Rank and select thesis |
| Target Builder | Producer + Loop | Build target list |
| Messaging Drafter | Producer + Loop | Generate messages |
| Partner Agent | Producer + Loop | Research partners |
| Insights Agent | Producer + Loop | Generate exec reports |
| Export Agent | Deterministic | Transform to CSV |
| Dashboard Sync | Deterministic | Update dashboard |

---

## Trigger Graph (DAG) — Complete

```
                         ┌────────────────────┐
                         │    TRIGGER         │
                         │ (cron/webhook/     │
                         │  manual/event)     │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │  Signal Scanner    │
                         │      Loop          │
                         └─────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       [thesis_candidate]   [trigger_target]    [partner_lead]
              │                    │                    │
              ▼                    │                    ▼
    ┌──────────────────┐          │          ┌──────────────────┐
    │ Thesis Selector  │          │          │  Partner Agent   │──────┐
    │      Loop        │          │          │     Loop         │      │
    └────────┬─────────┘          │          └──────────────────┘      │
             │                    │                                     │
             ▼                    │                                     │
    ┌──────────────────┐          │                                     │
    │  Target Builder  │◀─────────┘                                     │
    │      Loop        │                                                │
    └────────┬─────────┘                                                │
             │                                                          │
             ▼                                                          │
    ┌──────────────────┐                                                │
    │ Messaging Drafter│                                                │
    │      Loop        │                                                │
    └────────┬─────────┘                                                │
             │                                                          │
             ▼                                                          │
    ┌──────────────────┐                                                │
    │   Export Agent   │                                                │
    │  (Deterministic) │                                                │
    └────────┬─────────┘                                                │
             │                                                          │
             ▼                                                          │
    ┌──────────────────┐       ┌──────────────────┐                    │
    │  Dashboard Sync  │──────▶│  Insights Agent  │◀───────────────────┘
    │  (Deterministic) │       │      Loop        │
    └────────┬─────────┘       └────────┬─────────┘
             │                          │
             ▼                          ▼
    ┌──────────────────┐       ┌──────────────────┐
    │   CYCLE END      │       │  Weekly Digest   │
    │ (complete/failed)│       │   (auto-ship)    │
    └──────────────────┘       └──────────────────┘

    ─────────────────────── ESCALATION PATH ───────────────────────

    Any loop can escalate:

    [Agent Loop] ───── score < threshold after max attempts ─────▶ [Escalation Queue]
                                                                         │
                                      ┌──────────────────────────────────┘
                                      ▼
                           ┌──────────────────┐
                           │  Human Review    │
                           │  (Dashboard UI)  │
                           └────────┬─────────┘
                                    │
                      ┌─────────────┼─────────────┐
                      ▼             ▼             ▼
                  [Approve]    [Override]    [Dismiss]
                      │             │             │
                      ▼             ▼             ▼
              Resume cycle    Update output   Skip agent
```

---

## State Transitions (Full State Machine)

### Cycle States

```
                                    ┌──────────────┐
                                    │ initialized  │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │   scanning   │◀────────┐
                                    └──────┬───────┘         │
                                           │                 │
                      ┌────────────────────┼─────────────────┤
                      ▼                    ▼                 │
               ┌─────────────┐      ┌─────────────┐          │
               │thesis_      │      │target_      │          │
               │selecting    │      │building     │          │
               └──────┬──────┘      └──────┬──────┘          │
                      │                    │                 │
                      └────────┬───────────┘                 │
                               ▼                             │
                        ┌─────────────┐                      │
                        │  messaging  │                      │
                        └──────┬──────┘                      │
                               │                             │
                               ▼                             │
                        ┌─────────────┐                      │
                        │  exporting  │                      │
                        └──────┬──────┘                      │
                               │                             │
                               ▼                             │
                        ┌─────────────┐                      │
                        │   syncing   │                      │
                        └──────┬──────┘                      │
                               │                             │
                     ┌─────────┴─────────┐                   │
                     ▼                   ▼                   │
              ┌─────────────┐     ┌─────────────┐           │
              │  complete   │     │   paused    │───────────┘
              └─────────────┘     │(escalation) │
                                  └─────────────┘
                                        │
                                        ▼
                                 [Human Resolution]
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                  ┌───────────┐  ┌───────────┐  ┌───────────┐
                  │  resumed  │  │ overridden│  │  failed   │
                  └───────────┘  └───────────┘  └───────────┘
```

---

## Stop Conditions + Scoring Thresholds (Complete)

### All Agents Summary

| Agent | Threshold | Max Attempts | Escalate Conditions |
|-------|-----------|--------------|---------------------|
| Signal Scanner | 0.85 | 2 | 0 signals, competitor signal |
| Thesis Selector | 0.80 + margin 0.15 | 2 | All < 0.70, tie |
| Target Builder | 0.85 | 3 | Competitor/customer, < 5 targets |
| Messaging Drafter | 0.85 | 3 | Never (always improvable) |
| Partner Agent | 0.85 | 2 | Exec-level, leadership intro |
| Insights Agent | 0.85 + scorecard 4/5 | 2 | Scorecard < 3/5, blocker |

---

## Files/Artifacts After Completion (Delta from Medium)

### New Files

```
SYSTEM/
├── orchestrator/
│   ├── loop-engine.ts               # FROM MVP
│   ├── cycle-manager.ts             # FROM MEDIUM
│   ├── dag-controller.ts            # NEW: DAG execution
│   ├── state-machine.ts             # NEW: State transitions
│   ├── escalation-router.ts         # NEW: Escalation logic
│   └── retry-handler.ts             # NEW: Backoff + budgets
├── rubrics/
│   ├── (existing)
│   ├── partner-fit.yaml             # NEW
│   └── insight-accuracy.yaml        # NEW
├── prompts/
│   ├── producers/
│   │   ├── (existing)
│   │   ├── partner-agent.md         # NEW
│   │   └── insights-agent.md        # NEW
│   ├── evaluators/
│   │   ├── (existing)
│   │   ├── partner-agent-evaluator.md  # NEW
│   │   └── insights-agent-evaluator.md # NEW
│   └── revisers/
│       ├── (existing)
│       ├── partner-agent-reviser.md    # NEW
│       └── insights-agent-reviser.md   # NEW
├── playbooks/
│   ├── signal-scanning.md           # NEW
│   ├── thesis-selection.md          # NEW
│   ├── target-building.md           # NEW
│   ├── messaging.md                 # NEW
│   ├── partner-research.md          # NEW
│   └── escalation.md                # NEW
└── examples/
    ├── gold-signals/                # NEW
    ├── gold-targets/                # NEW
    ├── gold-messages/               # NEW
    ├── gold-partners/               # NEW
    └── anti-patterns/               # NEW

dashboard/
└── src/
    └── components/
        ├── escalation/              # NEW
        │   ├── EscalationQueue.tsx
        │   ├── EscalationCard.tsx
        │   └── ResolutionModal.tsx
        └── observability/           # NEW
            ├── CycleTimeline.tsx
            ├── AgentMetrics.tsx
            └── RunInspector.tsx
```

---

## DB Schema Changes (Hard Delta)

Add `escalations` table:

```typescript
export const escalations = sqliteTable('escalations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: text('cycle_id').notNull(),
  runId: integer('run_id'),

  // Classification
  category: text('category').notNull(), // 'urgent' | 'review' | 'fyi'
  agentName: text('agent_name').notNull(),

  // Details
  reason: text('reason').notNull(),
  context: text('context'), // JSON with additional context
  suggestedFixes: text('suggested_fixes'), // JSON array

  // Resolution
  status: text('status').notNull(), // 'pending' | 'resolved' | 'dismissed'
  resolvedBy: text('resolved_by'),
  resolution: text('resolution'),
  resolutionNotes: text('resolution_notes'),

  // Timing
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});

export const observabilityMetrics = sqliteTable('observability_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: text('cycle_id'),
  agentName: text('agent_name'),

  // Metrics
  metricName: text('metric_name').notNull(),
  metricValue: real('metric_value').notNull(),
  metricUnit: text('metric_unit'),

  // Timing
  recordedAt: text('recorded_at').notNull(),
});

export const learningFeedback = sqliteTable('learning_feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: integer('run_id').notNull(),

  // Feedback
  feedbackType: text('feedback_type').notNull(), // 'correction' | 'approval' | 'improvement'
  originalOutput: text('original_output'),
  correctedOutput: text('corrected_output'),
  feedbackNotes: text('feedback_notes'),

  // Learning
  shouldAddToExamples: integer('should_add_to_examples', { mode: 'boolean' }),
  exampleCategory: text('example_category'), // 'gold' | 'anti-pattern'

  createdAt: text('created_at').notNull(),
});
```

---

## API Endpoints (Hard)

### Escalation Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/escalations` | GET | List pending escalations |
| `/api/escalations/:id` | GET | Get escalation details |
| `/api/escalations/:id/resolve` | POST | Resolve with action |
| `/api/escalations/:id/dismiss` | POST | Dismiss escalation |
| `/api/escalations/stats` | GET | Escalation metrics |

### Observability Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metrics/cycles` | GET | Cycle completion metrics |
| `/api/metrics/agents` | GET | Per-agent performance |
| `/api/metrics/confidence` | GET | Score distributions |
| `/api/metrics/escalations` | GET | Escalation rates |

### Webhook Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/cycle-complete` | POST | Notify on cycle completion |
| `/api/webhooks/escalation` | POST | Notify on new escalation |
| `/api/webhooks/digest-ready` | POST | Notify on weekly digest |

---

## Acceptance Tests (Hard)

### Test 1: Full Autonomous Cycle

```bash
# Start cycle, let it run to completion without intervention
npm run cycle:start -- --thesis "LATAM Fintech Series A" --autonomous
```

Expected:
- Cycle completes with status `complete`
- All agents ran with passing scores
- No escalations triggered

### Test 2: Escalation Flow

```bash
# Inject low-quality output that triggers escalation
npm run test:escalation -- --agent target_builder --force-fail
```

Expected:
- Escalation record created in DB
- Status shows in escalation queue UI
- Resolution updates cycle state

### Test 3: Observability Metrics

```bash
# Check metrics after 5 cycles
curl http://localhost:3001/api/metrics/agents
```

Expected:
- Per-agent pass rates
- Average scores
- Retry rates
- Duration distributions

### Test 4: End-to-End Timing

```bash
# Measure cycle completion time
npm run cycle:benchmark
```

Expected:
- Signal → Export in < 2 hours
- No human intervention required

### Test 5: Weekly Digest Auto-Ship

```bash
# Verify digest sends automatically
npm run test:digest -- --mock-cycle-complete
```

Expected:
- Digest generated with score >= 4/5
- Webhook fired to configured endpoint
- No human review required

---

## Observability Dashboard Components

### Cycle Timeline View

```
┌─────────────────────────────────────────────────────────────────────┐
│  Cycle: 2026-01-31-001                              Status: complete│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Signal Scanner  ████████████░░░░░░░░░░░░░░░░░░░░░  2 attempts     │
│                  Score: 0.72 → 0.89 (passed)                        │
│                                                                     │
│  Thesis Selector ████████░░░░░░░░░░░░░░░░░░░░░░░░░  1 attempt      │
│                  Score: 0.86 (passed)                               │
│                                                                     │
│  Target Builder  ████████████████░░░░░░░░░░░░░░░░░  3 attempts     │
│                  Score: 0.68 → 0.76 → 0.91 (passed)                 │
│                                                                     │
│  Messaging       ██████████████████░░░░░░░░░░░░░░░  2 attempts     │
│                  Score: 0.81 → 0.92 (passed)                        │
│                                                                     │
│  Export          ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (deterministic)│
│                                                                     │
│  Dashboard Sync  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (deterministic)│
│                                                                     │
│  Total Duration: 47 minutes                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Escalation Queue View

```
┌─────────────────────────────────────────────────────────────────────┐
│  Escalation Queue                                    3 pending      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [URGENT] Target Builder — Competitor detected                      │
│  Cycle: 2026-01-30-002 | Score: 0.72 | 3 attempts                  │
│  Issue: "Acme Corp" is a known competitor                          │
│  [Resolve] [Override] [Dismiss]                                     │
│                                                                     │
│  [REVIEW] Partner Agent — Exec-level intro required                 │
│  Cycle: 2026-01-29-001 | Score: 0.88 | 2 attempts                  │
│  Issue: Partner CEO requires leadership intro                       │
│  [Resolve] [Override] [Dismiss]                                     │
│                                                                     │
│  [FYI] Insights Agent — Scorecard below target                      │
│  Cycle: 2026-01-28-001 | Score: 0.85 | Scorecard: 3/5              │
│  Issue: Pipeline movement metric missed target                      │
│  [Acknowledge]                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics (Hard Stage)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Human gates per cycle | 0-2 conditional | Count escalations requiring intervention |
| Cycle completion time | < 2 hours | End-to-end timing |
| Autonomous completion rate | > 85% | Cycles completing without escalation |
| Average confidence score | > 0.90 | Mean across all agents |
| Retry rate | < 20% | Runs requiring revision |
| Escalation resolution time | < 4 hours | Time from escalation to resolution |

---

## What Hard Completes

After Hard stage, the system:

1. Runs fully autonomously on trigger (cron/webhook)
2. Handles all agent loops with retry/revision
3. Escalates only when thresholds fail
4. Provides real-time observability dashboard
5. Auto-ships weekly digest if quality passes
6. Learns from feedback via example libraries
7. Logs all runs for audit and improvement
