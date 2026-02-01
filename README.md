# Growth OS - Bitcoin Ecosystem Channel

Growth OS is Paystand's operating system for turning Bitcoin ecosystem signals into qualified targets, outreach packs, and partner briefs. It combines structured configs, a knowledge base, and agent loops to keep research, scoring, and delivery consistent.

This README focuses on running the dashboard locally and understanding how the Vercel deployment works.

## Getting Started (New Collaborator- Dessy)

### 1) Get the code
**Option A — Git clone**
```bash
git clone https://github.com/FedeRojas18/growth-os.git
cd growth-os
```

**Option B — Download ZIP**
1. On GitHub, click **Code → Download ZIP**
2. Unzip it and open the `growth-os` folder

### 2) Install dependencies
```bash
# (Optional) If you have root-level tooling, run this at repo root
npm install

# Dashboard dependencies
cd dashboard
npm install
```

### 3) Run locally
```bash
cd dashboard
npm run dev
```
Open: `http://localhost:3000`

### What works without DB access vs what requires Turso
**Works without Turso** (read‑only):
- UI exploration (Dashboard, Targets, Partners)
- Pipeline data parsed from markdown in `KNOWLEDGE/`

**Requires Turso env vars** (read/write):
- Insights data
- Notes, reminders, activity timeline
- Drag/drop persistence (state overrides)
- Todos + Weekly Digest

## What Growth OS is
- A repeatable workflow for signal scanning -> thesis selection -> target building -> messaging -> exports.
- A shared system of record for sources, segments, triggers, and pipeline state.
- A set of specs and scaffolding that evolve by stage (MVP -> Medium -> Hard).

## Repo layout
- `dashboard/` - Vite + React dashboard (UI + API).
- `KNOWLEDGE/` - ecosystem guide, sources, pipeline state, experiments.
- `SYSTEM/` - agent configs, prompts, rubrics, orchestrator, architecture specs.
- `WORK/` - weekly execution artifacts and run history.
- `EXPORTS/` - generated deliverables (weekly, partners, reports).
- `DOCS/` - canonical specs and getting started docs.
- `ARCHIVE/` - retired docs and completed projects.

## Local setup (dashboard)

### Prereqs
- Node 18+ (Node 20+ recommended)
- npm

### Install
```bash
cd dashboard
npm install
```

### Run UI + API locally
```bash
cd dashboard
npm run dev
```

This runs:
- Vite dev server on `http://localhost:3000`
- Local API server (Express) on `http://localhost:3001`
- Vite proxies `/api/*` to `http://localhost:3001`

### Local API behavior
Local API is implemented in `dashboard/server/` and reads from the local markdown files in the repo:
- `KNOWLEDGE/target-pipeline.md`
- `KNOWLEDGE/partnership-pipeline.md`
- `KNOWLEDGE/roi-metrics.md`

It also uses a SQLite database for operational data (notes, reminders, overrides).

By default, local DB is stored as `dashboard/local.db` if no Turso env vars are set.

## Database (Turso)

### Required env vars (for production and optional locally)
Set these in your shell or a local `.env` file:
```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

### Migrations (create tables)
```bash
cd dashboard
npm run db:push
```

If Vercel reports `no such table`, migrations were not applied to the same Turso database that Vercel is using.

## Deployment (Vercel)

### How the API works in production
Vercel treats `dashboard/api/` as serverless functions.

Important:
- These handlers run in Node.js runtime (`runtime: 'nodejs'`)
- All handlers require Turso env vars
- If env vars are missing, they return **503** with `{ error: "TURSO env missing" }`

### Health endpoint
There is a production-safe health endpoint:
```
/api/health
```
It returns:
- `hasUrl`, `hasToken`
- `urlHost`
- Node version
- request diagnostics (method, url, host header)

### Vercel env variables
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Make sure these are set in Vercel project settings and match the DB that has been migrated.

## Troubleshooting

### API returns 503
- Turso env vars are missing in Vercel.
- Check `/api/health` and confirm `hasUrl` + `hasToken` are true.

### API error: no such table
- Migrations were not applied to the Turso DB configured in Vercel.
- Re-run `npm run db:push` using the same `TURSO_DATABASE_URL`.

### API error: Invalid URL
- This should be fixed (Node-safe URL parsing is used).
- If it reappears, confirm you are on the latest deployed version.

### Drag/drop reverts after drop
- Usually indicates `/api/state-overrides` failed.
- Check Network tab for 500/503.

## Agents system (for reference)
Growth OS uses Producer -> Evaluator -> Reviser loops with explicit run records and artifacts.
- Agent contracts, run records, and rubric format: `SYSTEM/core/README.md`
- Workflow spec: `SYSTEM/AGENT-WORKFLOW.md`
- Loop engine scaffold: `SYSTEM/orchestrator/loop-engine.ts`

### MVP loop engine (CLI)
```bash
npx tsx SYSTEM/orchestrator/loop-engine.ts 2026-02-01-001 target_builder
```

## Canonical specs
- v3 spec: `DOCS/growth-os-v3-spec.md`
- v3.1 proposal (not approved): `DOCS/growth-os-v3.1-proposal.md`
