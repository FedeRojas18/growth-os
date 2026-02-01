# Dashboard README

This document mirrors the root README but is scoped to the dashboard app for quick reference.

## Getting Started (New Collaborator)

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

## Local API behavior
Local API is implemented in `dashboard/server/` and reads from the local markdown files in the repo:
- `KNOWLEDGE/target-pipeline.md`
- `KNOWLEDGE/partnership-pipeline.md`
- `KNOWLEDGE/roi-metrics.md`

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

## Deployment (Vercel)

Vercel treats `dashboard/api/` as serverless functions.

Important:
- These handlers run in Node.js runtime (`runtime: 'nodejs'`)
- All handlers require Turso env vars
- If env vars are missing, they return **503** with `{ error: "TURSO env missing" }`

## Troubleshooting (quick)
- **503**: env vars missing → check `/api/health`
- **no such table**: run `npm run db:push` against the same Turso DB as Vercel
- **Drag/drop reverts**: `/api/state-overrides` failing
