# Stage 00: MVP — Single Autonomy Loop

> **Goal:** Prove one working Producer → Evaluator → Reviser loop with standard run logging.
> **Agent:** Target Builder only
> **Outcome:** A reusable loop engine that can be extended to other agents without code changes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MVP: TARGET BUILDER LOOP                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      LOOP ENGINE (Generic)                       │   │
│  │                                                                  │   │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐                  │   │
│  │   │ Producer │───▶│ Evaluator│───▶│ Reviser  │──┐               │   │
│  │   │  Agent   │    │  Agent   │    │  Agent   │  │               │   │
│  │   └──────────┘    └──────────┘    └──────────┘  │               │   │
│  │        ▲                                        │               │   │
│  │        └────────────────────────────────────────┘               │   │
│  │                    (loop until pass or max attempts)            │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         RUN LEDGER                               │   │
│  │              (SQLite agent_runs table + file artifacts)          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent List (MVP Only)

| Agent | Type | Purpose |
|-------|------|---------|
| Target Builder | Producer | Generate target list from thesis inputs |
| Target Evaluator | Evaluator | Score target list against quality rubric |
| Target Reviser | Reviser | Fix issues identified by evaluator |

---

## Trigger Graph (DAG)

```
[Manual Invoke]
      │
      ▼
┌─────────────┐
│   Target    │
│   Builder   │
│  (Producer) │
└──────┬──────┘
       │ produces target-list.md
       ▼
┌─────────────┐
│   Target    │
│  Evaluator  │
│  (Grader)   │
└──────┬──────┘
       │
       ├──── score >= 0.85 ────▶ [PASS] ────▶ Save final artifact
       │
       └──── score < 0.85 ────▶ [FAIL]
                                   │
                                   ▼
                            ┌─────────────┐
                            │   Target    │
                            │   Reviser   │
                            │  (Fixer)    │
                            └──────┬──────┘
                                   │
                                   ├──── attempt < max ────▶ Loop back to Evaluator
                                   │
                                   └──── attempt >= max ────▶ [ESCALATE] (log only, no UI)
```

---

## State Transitions

| State | Description | Next States |
|-------|-------------|-------------|
| `initialized` | Loop started | `producing` |
| `producing` | Producer generating output | `evaluating` |
| `evaluating` | Evaluator scoring output | `passed`, `revising`, `escalated` |
| `revising` | Reviser fixing issues | `evaluating` |
| `passed` | Score >= threshold | (terminal) |
| `escalated` | Max attempts exceeded | (terminal) |

---

## Stop Conditions + Scoring Thresholds

### Target Builder Rubric

| Dimension | Weight | Pass (1.0) | Partial | Fail (0.0) |
|-----------|--------|------------|---------|------------|
| trigger_validity | 0.30 | Exact library match + source | Weak source (0.7) | No trigger |
| trigger_recency | 0.20 | < 14 days | 14-30 days (0.8) | Outside window |
| buyer_identified | 0.20 | Name + title + LinkedIn | Name + title (0.8) | None |
| bu_fit | 0.15 | Clear primary BU | Dual fit (0.7) | None |
| dedup_check | 0.15 | Not in history | > 90 days (0.5) | < 90 days |

**Threshold:** 0.85 (weighted average)
**Max Attempts:** 3

### Stop Conditions

- **PASS**: `overallScore >= 0.85`
- **FAIL + RETRY**: `overallScore < 0.85 AND attempt < 3`
- **ESCALATE**: `overallScore < 0.85 AND attempt >= 3`

---

## Outputs (MVP)

- Run artifacts in `WORK/runs/{cycle-id}/target_builder/` (attempts, evals, final output).
- Run records logged to `agent_runs` (schema tracked in the build pack).

Implementation details, schema deltas, and acceptance criteria live in `SYSTEM/architecture/00-mvp/CODEX-BUILD-PACK.md` to avoid duplication.

---

## What MVP Does NOT Include

- No multi-agent orchestration
- No DAG controller
- No cycle management
- No escalation UI
- No API endpoints
- No observability dashboard
- No human escalation workflow

These are added in Medium and Hard stages.
