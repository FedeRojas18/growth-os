# Bitcoin Ecosystem Growth OS v2.1

> **Source of truth for the Paystand Bitcoin Ecosystem Channel operating system.**
> Last updated: January 2026

---

## Table of Contents

1. [System Purpose + Constraints](#1-system-purpose--constraints)
2. [Changelog v2 → v2.1](#2-changelog-v2--v21)
3. [Agent List + Execution Order](#3-agent-list--execution-order)
4. [Weekly Operating Cadence](#4-weekly-operating-cadence)
5. [Skip / Deprioritize Policy](#5-skip--deprioritize-policy)
6. [Trigger Library](#6-trigger-library)
7. [Segment Menu](#7-segment-menu)
8. [ROI Definitions](#8-roi-definitions)
9. [Repo Structure](#9-repo-structure)
10. [Key Knowledge-Base Files](#10-key-knowledge-base-files)
11. [Verification Checklist](#11-verification-checklist)
12. [Assumptions](#12-assumptions)

---

## 1. System Purpose + Constraints

### Core Insight

This role is a **research-to-outreach-plan pipeline**. The JGA (Fede) does not execute outreach — a TeamPay team member does. The JGA produces intelligence, target lists, messaging, and partnership recommendations. AI agents create massive leverage here by automating the research-synthesis-formatting loop while keeping strategic judgment and relationship-building human.

### SOW Summary

1. **20 hrs/week Junior Growth Associate** supporting Paystand's ecosystem GTM across Bitwage (cross-border payments), TeamPay (BTC rewards card as ecosystem wedge), Mining, and Foundation
2. **Core weekly deliverable:** Growth test plan with trigger-qualified target list, pain points, sample messaging, segment thesis, and expected outcomes — handed to a TeamPay team member for execution
3. **90-day goals:** Weekly test plans, 2-3 growth experiments, channel partnerships producing 10 organic referrals, consistent weekly leadership reporting
4. **Strategic context:** $77K Q1-Q2 budget across 9 LATAM/NA events, dual-channel positioning (Bitwage revenue + TeamPay ecosystem wedge), LATAM-first for cost efficiency
5. **Current state:** Event analysis and strategic planning completed manually; no automation for research, targeting, outreach, partnerships, or reporting

### Targeting Scope (All Agents)

All agents operate across the full channel scope, not just Bitcoin/crypto:

- **Cross-border payroll + contractor payments** (Bitwage core)
- **Stablecoin adoption in LATAM** (Bitwage growth vector)
- **Bitcoin-native companies + fintech operators** (TeamPay ecosystem wedge)
- **Mining + infrastructure ecosystem** (Mining BU relationships)
- **NGOs / circular economy partners** (Foundation, when relevant)

The system follows signal density and conversion potential, not a fixed vertical.

### Scope Guardrails

Before any agent spends time on a segment, company, or partner outside the core scope above, it must pass this 3-question gate:

1. **Signal density:** Are there ≥3 identifiable companies with active triggers in this segment right now?
2. **Buyer clarity:** Can we name the job title of the person who would buy / partner? (If "unclear" → skip)
3. **Path to pipeline:** Does working this segment produce a target list, a partner intro, or an event lead within 2 weeks? (If no → deprioritize to Thursday deep research, not Monday/Tuesday execution)

If a segment fails any gate → it goes into `knowledge-base/ecosystem-guide.md` as a "watch" item, not into the active pipeline.

---

## 2. Changelog v2 → v2.1

| # | What Changed | Why |
|---|-------------|-----|
| 1 | **Added `knowledge-base/roi-metrics.md`** with channel-level weekly scorecard + BU-level metrics + ROI enforcement rules | v2 said "ROI-first" but never defined what ROI means per BU or what a good week looks like. Without numbers, agents optimize for activity instead of outcomes. |
| 2 | **Added `knowledge-base/target-pipeline.md`** with state machine (New→Contacted→Replied→Meeting→Passed) and weekly update rules | v2 tracked target *history* (dedup) but not target *state*. Pipeline movement is the leading indicator of revenue — it must be tracked weekly. |
| 3 | **Added "No Signal Without Action" gate to Ecosystem Intelligence Monitor** | Every kept signal must map to exactly one action type (thesis candidate, trigger target, or partner lead). If it doesn't map → drop it. |
| 4 | **Added Skip / Deprioritize Policy** | System-wide gate: no trigger = no target, no buyer = skip, no path to intro = deprioritize. |
| 5 | **Added Trigger Library + Segment Menu** | Curated options constrain thesis selection to high-probability options. |
| 6 | **Added Scope Guardrails** | 3-question gate: signal density, buyer clarity, and path to pipeline. |
| 7 | **Added Tuesday + Friday Feedback Loops** | Tuesday: update target files. Friday: apply learnings to system files. |
| 8 | **Added target-pipeline.md to repo structure** | Pipeline visibility was missing. |
| 9 | **Added roi-metrics.md to repo structure** | ROI definitions were missing. |

**What did NOT change:** 6 agents, weekly cadence, 5 loops, repo layout, targeting scope, core insight. This is a patch, not a redesign.

---

## 3. Agent List + Execution Order

| Order | Agent | Day | What It Automates | What Stays Human |
|-------|-------|-----|-------------------|------------------|
| 1 | **Ecosystem Intelligence Monitor** | Mon | Source scanning, signal filtering, action mapping, digest | Interpreting strategic implications, escalation decisions |
| 2 | **Segment Thesis Selector** | Mon | Proposes 3 ranked theses from segment menu + signals | Final thesis selection (human picks) |
| 3 | **Target List Builder** | Mon→Tue | Trigger-based company ID, enrichment, pain mapping, dedup | Final curation, fit scoring, trigger validation |
| 4 | **Messaging Drafter** | Tue | Outreach variants, pain-to-product mapping, formatting | Tone calibration, strategic framing, approval |
| 5 | **Partner One-Pager** | Wed | Partner research, fit assessment, mutual value framing | Relationship building, negotiation, communication |
| 6 | **Weekly Exec Update** | Fri | Data aggregation, pipeline snapshot, signal summary | Narrative framing, strategic asks, blocker escalation |

### Agent Files

| File | Purpose |
|------|---------|
| `agents/ecosystem-intelligence.md` | Scan sources.md, filter signals, action mapping, produce Monday digest |
| `agents/segment-thesis-selector.md` | Ingest digest + segment menu + context, propose 3 ranked theses |
| `agents/target-list-builder.md` | Trigger-based research, 10-15 targets max, enrichment, dedup, skip rules enforced |
| `agents/messaging-drafter.md` | Pain-to-product messaging, 2-3 variants per channel |
| `agents/partner-one-pager.md` | Partner research, mutual value, intro script, next step |
| `agents/weekly-exec-update.md` | Aggregate week's outputs + pipeline snapshot into leadership email format |

---

## 4. Weekly Operating Cadence

### The 5 Weekly Loops

| # | Loop | Output | Ship Day | % of 20 hrs |
|---|------|--------|----------|-------------|
| 1 | **Intelligence + Thesis Selection** | Signal digest with action mapping + 3 ranked theses → human picks 1 | Monday | 20% (4 hrs) |
| 2 | **Target Research + Test Plan** | Trigger-qualified target list (10-15) + messaging + thesis → saved to /weekly-plans/ | Tuesday | 30% (6 hrs) |
| 3 | **Channel Partnerships** | 1-2 partner conversations advanced + partner one-pager(s) | Wednesday | 20% (4 hrs) |
| 4 | **Deep Research + Experiments** | Ecosystem guide updates + experiment tracking | Thursday | 15% (3 hrs) |
| 5 | **Exec Update + Planning** | Leadership email + feedback loop + next week prep | Friday | 15% (3 hrs) |

### Daily Breakdown

```
MONDAY (4 hrs) — Intelligence + Thesis
  └─ Run Ecosystem Intelligence Monitor → review digest + action mapping (30 min)
  └─ Run Segment Thesis Selector → review 3 options (30 min)
  └─ Select thesis, trigger Target List Builder (30 min)
  └─ Begin reviewing Target List Builder output (1.5 hrs)
  └─ Partnership pipeline check-ins (1 hr)

TUESDAY (4 hrs) — Test Plan Assembly
  └─ Finalize Target List Builder output — validate triggers (1.5 hrs)
  └─ Run Messaging Drafter → review + refine (1.5 hrs)
  └─ Assemble weekly test plan → save to /weekly-plans/YYYY-MM-DD-weekly-test-plan.md (45 min) ← CORE DELIVERABLE
  └─ FEEDBACK LOOP: Update target-history.md + target-pipeline.md with new targets (15 min)

WEDNESDAY (4 hrs) — Partnerships
  └─ Research new partner prospects (1.5 hrs)
  └─ Run Partner One-Pager for 1-2 targets (1 hr)
  └─ Follow-up on existing partner conversations (1 hr)
  └─ Ad-hoc enablement requests (30 min)

THURSDAY (3 hrs) — Deep Research + Experiments
  └─ Deep-dive on next week's thesis candidates (1.5 hrs)
  └─ Update ecosystem knowledge base (45 min)
  └─ Experiment tracking + results documentation (45 min)

FRIDAY (3 hrs) — Exec Update + Planning
  └─ Run Weekly Exec Update agent → review + refine (45 min)
  └─ Ship exec update email (30 min)
  └─ FEEDBACK LOOP: Update target-pipeline.md states, review roi-metrics scorecard,
     apply learnings to trigger library / segment menu / sources.md (30 min)
  └─ Week retrospective — what worked, what didn't (30 min)
  └─ Pre-plan next week — queue Monday sources, flag topics (45 min)
```

---

## 5. Skip / Deprioritize Policy

These rules apply across ALL agents. Any agent output that violates these rules must be flagged and excluded.

### Hard Skips (never include)

- No trigger signal → no target (Target List Builder)
- No identifiable buyer (job title + name) → skip company
- No clear BU fit (Bitwage / TeamPay / Mining) → skip company
- Signal has no action mapping (thesis / trigger / partner) → drop from digest (Intelligence Monitor)
- Partner has no mutual value exchange identifiable → skip (Partner One-Pager)

### Deprioritize (park for later, don't execute now)

- Segment has <3 trigger-qualified companies → move to Thursday research, not Tuesday plan
- Partner requires >3 touchpoints before any referral path → deprioritize behind warmer leads
- Signal is "interesting but no conversion path visible" → log in ecosystem-guide.md, do not action

**Enforcement:** Every agent's step-by-step procedure includes a "Check skip rules" step before producing output.

---

## 6. Trigger Library

Living list of valid "why now" signals. A target MUST have ≥1 of these to be included in any weekly test plan.

| Category | Trigger Signal | Best BU Fit | Example |
|----------|---------------|-------------|---------|
| **Hiring** | Posting roles in LATAM, remote-global payroll, international ops | Bitwage | "Company X hiring LATAM contractors on LinkedIn" |
| **Expansion** | Announced LATAM expansion, new office in MX/BR/CO | Bitwage | "Fintech Y opening São Paulo office" |
| **Stablecoin adoption** | Announced stablecoin integration, USDC/USDT usage, cross-border pilot | Bitwage | "Payment provider Z adding USDC rails for LATAM" |
| **Crypto/BTC treasury** | Public BTC purchase, treasury policy change, SEC filing | TeamPay | "Company W adds $20M BTC to balance sheet" |
| **Event presence** | Speaking/sponsoring at upcoming ecosystem event we're attending | TeamPay, Bitwage | "CEO of X speaking at LABITCONF" |
| **Funding round** | Raised capital (especially if fintech/crypto/LATAM focused) | TeamPay, Bitwage | "LATAM payroll startup raises Series A" |
| **Pain signal** | Public complaints about FX costs, slow payments, compliance burden | Bitwage | "CFO quoted on cross-border payment friction in interview" |
| **Partnership signal** | Announced partnership with ecosystem-adjacent company | Mining, TeamPay | "Mining op partners with energy provider in Paraguay" |
| **Regulatory trigger** | New regulation enabling/requiring crypto payments in a market | Bitwage | "Brazil stablecoin regulation finalized" |
| **Community activity** | Active in Bitcoin/fintech communities, forums, conferences | TeamPay | "Founder active in Bitcoin Twitter, 10K+ following" |

**Update rule:** Add new trigger types when they produce a reply rate >10% or a meeting. Remove triggers that produce zero replies after 3 weeks of use.

---

## 7. Segment Menu

Pre-vetted segments the Thesis Selector can draw from. New segments must pass scope guardrails first.

| Segment | Primary BU | Typical Buyer | Why High-Probability |
|---------|-----------|---------------|---------------------|
| LATAM-expanding fintechs with cross-border payroll needs | Bitwage | CFO, VP Finance, Head of People | Direct pain alignment, short sales cycle |
| Companies hiring remote contractors in MX/BR/CO/AR | Bitwage | Head of People, Finance Ops | Active FX friction, immediate use case |
| Bitcoin-native companies needing corporate finance tools | TeamPay | CFO, Founder | BTC card wedge → B2B platform upsell |
| Stablecoin payment providers building LATAM corridors | Bitwage | Head of Partnerships, CEO | Partnership + customer potential |
| Mining operations with multi-country vendor payments | Mining, Bitwage | CFO, Ops Director | Cross-border pain + infrastructure relationship |
| LATAM fintech event attendees/speakers (pre-event targeting) | Bitwage, TeamPay | CFO, Founder, BD Lead | Warm intro path via shared event context |
| NGOs / circular economy projects using Bitcoin in LATAM | Foundation | Program Director, ED | Mission alignment, ecosystem credibility |
| Companies that just announced BTC/stablecoin integration | TeamPay | CFO, CTO | Timing-driven, high receptivity |

**Update rule:** After each Tuesday ship, tag which segment was used. After 4 weeks, review segment performance (replies, meetings) and retire segments with zero conversion.

---

## 8. ROI Definitions

### Channel-Level Weekly Scorecard

The 5 numbers that matter (reported every Friday):

| # | Metric | Target |
|---|--------|--------|
| 1 | Test plan shipped | Yes every Tuesday |
| 2 | Targets added to pipeline | 10-15/week |
| 3 | Pipeline state changes | ≥3/week |
| 4 | Partner conversations advanced | 1-2/week |
| 5 | Exec update shipped | Yes every Friday |

**Scoring:** 5/5 = Great week | 4/5 = Acceptable | 3/5 or below = Red flag

### BU-Level ROI Summary

| BU | What Counts as ROI | Weekly Leading Indicator |
|----|--------------------|-----------------------|
| **Bitwage** | Qualified lead → sales conversation → pipeline | Targets contacted, replies received, meetings booked |
| **TeamPay** | Bitcoin-native logo acquired, ecosystem credibility signal | Event connections made, BTC card interest signals, logo pipeline |
| **Mining** | Strategic relationship advanced, infrastructure partner intro | Partner conversations, intro requests made |
| **Foundation** | Ecosystem presence, community engagement | Event attendance confirmed, community mentions |

Full definitions in `knowledge-base/roi-metrics.md`.

---

## 9. Repo Structure

```
bitcoin-ecosystem-analysis/
├── agents/
│   ├── ecosystem-intelligence.md     ← Agent 1: Monday signal digest + action mapping
│   ├── segment-thesis-selector.md    ← Agent 2: Monday thesis proposals
│   ├── target-list-builder.md        ← Agent 3: Trigger-based targeting
│   ├── messaging-drafter.md          ← Agent 4: Outreach variants
│   ├── partner-one-pager.md          ← Agent 5: Partnership artifacts
│   └── weekly-exec-update.md         ← Agent 6: Friday leadership email
├── templates/
│   ├── weekly-test-plan.md           ← Test plan format
│   ├── weekly-exec-update.md         ← Exec update email format
│   └── partner-one-pager.md          ← Partner brief format
├── knowledge-base/
│   ├── sources.md                    ← Explicit source list for Agent 1
│   ├── roi-metrics.md                ← ROI definitions + weekly scorecard + enforcement rules
│   ├── target-pipeline.md            ← Target state tracking: New→Contacted→Replied→Meeting→Passed
│   ├── ecosystem-guide.md            ← Living ecosystem knowledge
│   ├── target-history.md             ← Running dedup log
│   ├── partnership-pipeline.md       ← Partner tracking
│   └── experiment-log.md             ← Growth experiment tracking
├── weekly-plans/                     ← Persistent weekly outputs
│   └── (YYYY-MM-DD-weekly-test-plan.md files accumulate here)
├── analysis/                         ← (existing) strategic analysis docs
├── communications/                   ← (existing) email templates
├── presentation/                     ← (existing) presentation assets
├── role_sow.md                       ← (existing) role definition
└── ecosystem_context.md              ← (existing) strategic context
```

---

## 10. Key Knowledge-Base Files

### `knowledge-base/roi-metrics.md`

- Channel-level weekly scorecard (5 metrics)
- BU-level ROI definitions (Bitwage, TeamPay, Mining, Foundation)
- ROI enforcement rules:
  - Rule 1: Pipeline Movement > Pipeline Size
  - Rule 2: No Artifact = No Work
  - Rule 3: Exec Update is the Funding Mechanism
  - Rule 4: Reply Rate is the Quality Signal
  - Rule 5: Referrals are the Partnership ROI
- Weekly ROI review checklist (Friday feedback loop)

### `knowledge-base/target-pipeline.md`

- Pipeline states: New → Contacted → Replied → Meeting → Passed (+ Closed-Lost, Nurture)
- Pipeline table with columns: Company | BU Fit | Trigger | State | Last Touch | Channel | Next Action | Owner
- Pipeline rules:
  - Rule 1: No Orphan Targets
  - Rule 2: State Must Move or Close (2-week max per state)
  - Rule 3: Last Touch Must Be Current
  - Rule 4: Next Action Must Be Specific
  - Rule 5: Friday Pipeline Snapshot for Exec Update
- Closed-Lost archive and Nurture list

### `knowledge-base/sources.md`

- Explicit source list with categories, URLs, scan frequency, and rationale
- Used by Agent 1 (Ecosystem Intelligence Monitor)

---

## 11. Verification Checklist

### Weekly Verification (Run Every Week)

**Monday:**
- [ ] Agent 1 (Ecosystem Intelligence Monitor) produces digest with action mapping table
- [ ] All kept signals map to exactly one action type (thesis/trigger/partner)
- [ ] Agent 2 (Segment Thesis Selector) proposes 3 ranked theses from segment menu
- [ ] Human selects thesis and triggers Agent 3 (Target List Builder)

**Tuesday:**
- [ ] Agent 3 output has 10-15 targets max, each with a valid trigger
- [ ] Agent 4 (Messaging Drafter) produces 2-3 variants per target
- [ ] Weekly test plan saved to `/weekly-plans/YYYY-MM-DD-weekly-test-plan.md`
- [ ] `target-history.md` updated with new targets (dedup)
- [ ] `target-pipeline.md` updated with new targets (state = New)

**Wednesday:**
- [ ] Agent 5 (Partner One-Pager) produces 1-2 partner briefs
- [ ] Each partner brief has: why they matter, mutual value, intro script, BU fit, next step

**Friday:**
- [ ] Agent 6 (Weekly Exec Update) produces email with: wins, pipeline movement, signals, next thesis, blockers
- [ ] Exec update email sent to leadership
- [ ] `target-pipeline.md` states updated based on outreach results
- [ ] Weekly scorecard calculated (5 metrics)
- [ ] Trigger library / segment menu updated if learnings apply

### System Verification (Build-Time)

1. Each agent file contains: purpose, inputs, outputs, step-by-step procedure, decision rules (skip logic), example run
2. Target List Builder enforces trigger requirement — no company without a "why now" signal
3. Ecosystem Intelligence Monitor includes "No Signal Without Action" gate and Action Mapping table
4. Segment Thesis Selector output includes: thesis, why now, expected ROI, best triggers — for 3 options
5. Weekly Exec Update output matches format: wins, pipeline movement, signals, next thesis, blockers
6. Partner One-Pager output includes: why this partner, mutual value, intro script, BU fit, next step
7. sources.md has explicit URLs/names with rationale
8. roi-metrics.md has concrete weekly targets and enforcement rules
9. target-pipeline.md has state definitions, exit criteria, and "no orphan targets" rule
10. Templates match agent output formats exactly
11. `/weekly-plans/` directory exists with documented naming convention

### Troubleshooting

| If This Fails | Do This |
|---------------|---------|
| Agent 1 produces <5 signals | Check sources.md URLs; expand source list if needed |
| Agent 1 produces >20 signals | Re-apply action mapping gate more strictly |
| Agent 3 produces targets without triggers | Reject and re-run with stricter trigger validation |
| Agent 3 produces >15 targets | Reject lowest-priority targets until 10-15 remain |
| Tuesday test plan not shipped | Ship partial plan rather than none; identify blocker in Friday retro |
| Friday exec update not shipped | Ship abbreviated version; this is a critical failure, investigate immediately |
| Pipeline movement = 0 for 2 weeks | Stop adding new targets; focus entirely on advancing existing ones |
| Reply rate <5% for a segment after 2 weeks | Retire or refine the segment |

---

## 12. Assumptions

1. **TeamPay team member** is the primary outreach executor. Fede (JGA) produces plans; TeamPay member sends emails/LinkedIn messages.
2. **HubSpot** is the CRM. Pipeline states in `target-pipeline.md` are mirrored there when possible, but the markdown file is the source of truth for the Growth OS.
3. **"10 organic referrals by day 90"** means referrals that come through activated channel partners, not cold outreach replies.
4. **Foundation work** is tracked but does not consume more than 1-2 hrs/week from the 20-hour budget.
5. **Trigger library and segment menu** are living documents — they get updated every Friday based on what converted and what didn't.

---

## Files Referenced (Do Not Modify)

| File | Used By |
|------|---------|
| `role_sow.md` | All agents — deliverable requirements |
| `ecosystem_context.md` | All agents — BU positioning, metrics, operating principles |
| `analysis/bitcoin_ecosystem_analysis_handoff.md` | Agent 1+2 — evaluation frameworks, existing analysis |
| `communications/internal_email1.md` | Agent 6 — quality bar for leadership communications |
