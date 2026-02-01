# Growth OS - Bitcoin Ecosystem Channel

Growth OS is Paystand's operating system for turning Bitcoin ecosystem signals into qualified targets, outreach packs, and partner briefs. It combines structured configs, a knowledge base, and agent loops to keep research, scoring, and delivery consistent.

## What Growth OS is
- A repeatable workflow for signal scanning -> thesis selection -> target building -> messaging -> exports.
- A shared system of record for sources, segments, triggers, and pipeline state.
- A set of specs and scaffolding that evolve by stage (MVP -> Medium -> Hard).

## The Agents system
Growth OS uses Producer -> Evaluator -> Reviser loops with explicit run records and artifacts.
- Agent contracts, run records, and rubric format live in `SYSTEM/core/README.md`.
- The event-driven workflow spec is in `SYSTEM/AGENT-WORKFLOW.md`.
- Loop engine scaffold is in `SYSTEM/orchestrator/loop-engine.ts`.

## Current MVP scope (Stage 00)
- **Target Builder loop only** (Producer, Evaluator, Reviser).
- Run logging + rubric-based scoring.
- Config-driven agent registry (`SYSTEM/config/agents.yaml`).
- No multi-agent orchestration, escalation UI, or cycle manager yet.

See `SYSTEM/architecture/00-mvp/README.md` and `SYSTEM/architecture/00-mvp/CODEX-BUILD-PACK.md` for the MVP stage spec and tasks.

## Key folders
- `SYSTEM/` - agent configs, prompts, rubrics, orchestrator, and architecture specs.
- `KNOWLEDGE/` - ecosystem guide, sources, pipeline state, experiments.
- `dashboard/` - Vite + React dashboard (UI + API).
- `WORK/` - weekly execution artifacts and run history.
- `EXPORTS/` - generated deliverables (weekly, partners, reports).
- `DOCS/` - canonical specs and getting started docs.
- `ARCHIVE/` - retired docs and completed projects.

## Run locally

### Dashboard (UI + API)
```bash
cd dashboard
npm install
npm run dev
```

### MVP loop engine (CLI)
```bash
# Example run
npx tsx SYSTEM/orchestrator/loop-engine.ts 2026-02-01-001 target_builder
```

## Extend agents (add a new loop)
1. Add a rubric: `SYSTEM/rubrics/<agent>-quality.yaml` (format in `SYSTEM/core/README.md`).
2. Add prompts:
   - `SYSTEM/prompts/producers/<agent>.md`
   - `SYSTEM/prompts/evaluators/<agent>-evaluator.md`
   - `SYSTEM/prompts/revisers/<agent>-reviser.md`
3. Register the agent in `SYSTEM/config/agents.yaml` with rubric + prompt paths.
4. (Optional) Add examples in `SYSTEM/examples/` and update architecture docs if stage scope changes.

## Canonical specs
- v3 spec: `DOCS/growth-os-v3-spec.md`
- v3.1 proposal (not approved): `DOCS/growth-os-v3.1-proposal.md`
