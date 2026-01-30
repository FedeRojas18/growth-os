# Bitcoin Ecosystem Growth OS v3

> **Canonical specification for the Paystand Bitcoin Ecosystem Channel operating system.**
> Version: 3.0
> Last updated: January 2026

---

## Table of Contents

1. [Goals](#1-goals)
2. [Operators & Actors](#2-operators--actors)
3. [Modules](#3-modules)
4. [Inputs & Outputs](#4-inputs--outputs)
5. [Artifacts](#5-artifacts)
6. [Schemas](#6-schemas)
7. [Routing & Handoffs](#7-routing--handoffs)
8. [Approval Gates](#8-approval-gates)
9. [Weekly Operating Cadence](#9-weekly-operating-cadence)
10. [Build Phases](#10-build-phases)
11. [Repo Structure](#11-repo-structure)
12. [Migration from v2.1](#12-migration-from-v21)

---

## 1. Goals

### Primary Goal
Transform Growth OS from a "markdown document factory" into a **role-based execution system** that produces import-ready deliverables for 7 stakeholders.

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Role-Based Output Surfaces** | Every stakeholder gets deliverables optimized for their workflow, not one generic doc |
| **Import-Ready Exports** | Every output is directly usable in destination tools (Apollo, Sheets, Slack) |
| **Hybrid Cadence** | Weekly core cycle + on-demand modules for urgent opportunities |
| **Google Sheets as Pipeline Truth** | Single source of truth with dashboard view for live visibility |
| **Dual-Channel Notifications** | Slack for quick heartbeats, Email for formal deliverables |
| **Auto-Recommend, Human Approves** | System proceeds with recommendations; human clicks approve or overrides |

### Key Design Decisions

| Decision | Choice |
|----------|--------|
| Default export format | **Apollo CSV** (always included) |
| Pipeline source of truth | **Google Sheets** (proto-CRM) with dashboard tab |
| Notifications | **Slack + Email** (both) |
| Cadence | **Hybrid** (weekly core + on-demand) |
| Automation level | **Auto-recommend, human approves** |
| BU segmentation | **Generate BU-specific packs when targets exist** |
| Enrichment gaps | **Flag but include** (don't block exports) |

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to import targets to Apollo | <2 minutes |
| Time to view pipeline state | <30 seconds |
| Time to forward partner intro | <5 minutes |
| Friday report shipping effort | <30 minutes for 3 formats |

---

## 2. Operators & Actors

### 2.1 System Operators

| Operator | Role | Responsibilities |
|----------|------|------------------|
| **Fede** (JGA) | Control Tower | Run modules, approve recommendations, route deliverables, update pipeline |

### 2.2 Stakeholders (Consumers)

| Stakeholder | Role | Primary Deliverable | Notification Channel |
|-------------|------|---------------------|---------------------|
| **Ramiro/Jonathan** | Bitwage SDR/Growth | Apollo-ready Bitwage execution packs | Slack #bitwage-outbound + Email |
| **Meridith/Morgan** | TeamPay SDR/Growth | TeamPay logo + partner opportunity packs | Slack #teampay-outbound + Email |
| **Devin** | Paystand AE | AR-qualified leads + pipeline handoffs | Email |
| **Alexandra** | Mining Partner Intros | Mining partner briefs + intro scripts | Slack DM + Email |
| **Christian** | Partnerships VP | Strategic partner briefs + formal intro decks | Slack DM + Email |
| **Channel Team** (all) | Reporting | Slack heartbeat + PDF scoreboard + slide deck | Slack #bitcoin-channel + Email |

### 2.3 Actor Interactions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GROWTH OS v3                                   │
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   SIGNALS    │────▶│   TARGETS    │────▶│      DELIVERABLES        │ │
│  │  (Sources)   │     │  (Research)  │     │   (Role-Based Packs)     │ │
│  └──────────────┘     └──────────────┘     └──────────────────────────┘ │
│         │                    │                         │                 │
│         ▼                    ▼                         ▼                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │    Fede      │     │    Fede      │     │     Stakeholders         │ │
│  │  (Approve    │     │  (Validate   │     │  (Receive, Execute)      │ │
│  │   Thesis)    │     │   Targets)   │     │                          │ │
│  └──────────────┘     └──────────────┘     └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modules

### 3.1 Module Overview

| # | Module | Trigger | Purpose | Output |
|---|--------|---------|---------|--------|
| 1 | **Signal Scanner** | On-demand / Scheduled | Scan sources, filter signals, assign actions | Signal digest with action mapping |
| 2 | **Thesis Selector** | After Signal Scanner | Propose ranked thesis options | Recommended thesis + alternatives |
| 3 | **Target Builder** | After thesis approval | Research targets, validate triggers, enrich | Enriched target list by BU |
| 4 | **Message Generator** | After targets confirmed | Generate outreach variants | Message templates per target |
| 5 | **Apollo Exporter** | After messages | Transform to Apollo-ready format | Apollo CSV + sequence files |
| 6 | **BU Pack Generator** | After Apollo export | Split by BU, package for delivery | BU-specific execution packs |
| 7 | **Partner Brief** | On-demand | Research partner, generate intro assets | PDF brief + intro scripts |
| 8 | **Pipeline Syncer** | Continuous / Friday | Sync pipeline state | Google Sheets updates |
| 9 | **Channel Report** | Weekly / On-demand | Generate multi-surface reports | Slack + PDF + Slides |
| 10 | **Experiment Tracker** | On-demand | Track experiments and learnings | Experiment log updates |

### 3.2 Module Specifications

#### Module 1: Signal Scanner

**Purpose:** Scan all sources, filter for actionable signals, produce digest with action mapping.

**Inputs:**
- `config/sources.yaml` — Source URLs with scan instructions
- `knowledge/ecosystem-guide.md` — Context for relevance filtering
- Previous week's thesis — Continuity context

**Outputs:**
- Signal digest with action mapping table
- Each signal tagged: Thesis Candidate | Trigger Target | Partner Lead

**Rules:**
- Signal must be <7 days old
- Signal must relate to specific company/person
- Signal must map to exactly one action type (or drop)
- Apply scope guardrails (signal density, buyer clarity, path to pipeline)

---

#### Module 2: Thesis Selector

**Purpose:** Propose 3 ranked thesis options from segment menu + signals.

**Inputs:**
- Signal digest from Module 1
- `config/segments.yaml` — Pre-vetted segment menu
- Previous thesis performance data

**Outputs:**
- 3 ranked thesis options with scoring
- Recommended default (highest score)
- Scoring breakdown: Signal density (30%), Trigger strength (25%), BU priority (20%), Conversion history (15%), Research effort (10%)

**Approval Gate:** Human selects thesis or accepts recommendation.

---

#### Module 3: Target Builder

**Purpose:** Research and enrich 10-15 targets based on selected thesis.

**Inputs:**
- Selected thesis from Module 2
- `config/triggers.yaml` — Valid trigger types
- `history/target-history.yaml` — Dedup check (90-day window)

**Outputs:**
- Enriched target list (10-15 companies) with:
  - Company, Website, HQ, Size, Stage
  - Trigger, Trigger Date, Trigger Source
  - BU Fit (Bitwage/TeamPay/Mining)
  - Buyer Name, Buyer Title, Buyer LinkedIn, Buyer Email
  - Pain Hypothesis
- Skipped companies list with reasons

**Rules:**
- Every target MUST have ≥1 valid trigger from Trigger Library
- Trigger age: 30 days (most), 60 days (funding/treasury)
- Dedup against 90-day history
- Flag but include targets with enrichment gaps

---

#### Module 4: Message Generator

**Purpose:** Generate 2-3 message variants per target per channel.

**Inputs:**
- Target list from Module 3
- `config/bu-positioning.yaml` — BU value propositions
- Pain-to-product mapping

**Outputs:**
- Per target:
  - Email Variant A (Question-First / Observation-First / Direct-First)
  - Email Variant B (different structure)
  - LinkedIn message
  - Notes for sender

**Rules:**
- Email: <150 words
- LinkedIn: <75 words
- No banned phrases ("I wanted to reach out", "game-changing", etc.)
- Must reference specific trigger or pain
- Rotate proof points (don't reuse same detail)
- Match tone to buyer persona

---

#### Module 5: Apollo Exporter

**Purpose:** Transform target list + messages into Apollo-ready format.

**Inputs:**
- Target list from Module 3
- Messages from Module 4
- `config/export-formats.yaml` — Column mappings

**Outputs:**
- `[date]-all-targets.csv` — Full Apollo import file
- `[date]-sequences.md` — Message templates by sequence step:
  - Day 0: LinkedIn connect
  - Day 2: Email Variant A
  - Day 5: Email Variant B
  - Day 10: Final follow-up

**Schema:** See Section 6.1 for Apollo CSV schema.

---

#### Module 6: BU Pack Generator

**Purpose:** Split exports by BU, package for stakeholder delivery.

**Inputs:**
- Apollo export from Module 5
- `config/stakeholders.yaml` — Routing rules

**Outputs:**
- `bitwage-apollo.csv` + `bitwage-messages.md` (if Bitwage targets exist)
- `teampay-apollo.csv` + `teampay-messages.md` (if TeamPay targets exist)
- `mining-targets.csv` (if Mining targets exist)
- `weekly-brief.md` — Operator summary

**Routing:**
- Bitwage pack → Ramiro/Jonathan
- TeamPay pack → Meridith/Morgan
- Mining pack → Alexandra (if targets) or Alexandra (if partners)

---

#### Module 7: Partner Brief

**Purpose:** Research partner, generate forwardable brief + intro scripts.

**Inputs:**
- Partner company name
- `config/bu-positioning.yaml` — Value propositions
- Partner owner (Alexandra/Christian/Ramiro/Meridith)

**Outputs:**
- `[partner]-brief.pdf` — One-page forwardable brief:
  - Company overview (1 paragraph)
  - Why they matter to us (2-3 bullets)
  - Why we matter to them (2-3 bullets)
  - Mutual value proposition (1 sentence)
  - Key contact with LinkedIn
  - Risks/considerations
- `[partner]-intro-linkedin.txt` — Ready-to-send LinkedIn intro
- `[partner]-intro-email.txt` — Ready-to-send email intro
- `[partner]-deck.pptx` — (Only on request, after meeting booked)

**Routing:**
- Mining partners → Alexandra
- Strategic alliances → Christian
- Bitwage ecosystem → Ramiro/Jonathan
- TeamPay wedges → Meridith/Morgan

---

#### Module 8: Pipeline Syncer

**Purpose:** Maintain Google Sheets as single source of truth.

**Inputs:**
- New targets from Module 3
- State changes from outreach results
- `pipeline/pipeline-tracker.gsheet` — Current state

**Outputs:**
- Updated Google Sheets:
  - Active Pipeline tab
  - Dashboard tab (stage counts, WoW movement)
  - Archive tab (Closed-Lost, Nurture)
  - History tab (dedup log)

**Rules:**
- New targets → State = "New"
- After outreach → State = "Contacted"
- After reply → State = "Replied"
- After meeting → State = "Meeting"
- After handoff → State = "Passed"
- No response after 3 follow-ups → State = "Closed-Lost" or "Nurture"

---

#### Module 9: Channel Report

**Purpose:** Generate multi-surface reports for channel team.

**Inputs:**
- Pipeline state from Module 8
- Week's activities (targets, partners, wins)
- `knowledge/experiment-log.md` — Experiment updates

**Outputs:**
- `slack-heartbeat.md` — Quick Slack post (see template below)
- `channel-scoreboard.pdf` — One-page visual PDF
- `channel-slides.pptx` — 2-3 slide deck for biweekly meeting
- `full-report.md` — Source document

**Slack Heartbeat Template:**
```
📊 *Channel Weekly Heartbeat — Week of [DATE]*

Scorecard: [X]/5 [✅/⚠️]
• Test plan shipped: [✓/✗]
• Targets added: [N] (target: 10-15)
• Pipeline movement: [N] (target: ≥3)
• Partners advanced: [N] (target: 1-2)
• Report shipped: [✓/✗]

🎯 Top wins:
• [Win 1]
• [Win 2]

📈 Pipeline: [N] New | [N] Contacted | [N] Replied | [N] Meeting

🔗 [Full scoreboard PDF] | [Live dashboard]
```

---

#### Module 10: Experiment Tracker

**Purpose:** Track growth experiments and capture learnings.

**Inputs:**
- Experiment definitions
- Results data

**Outputs:**
- Updated `knowledge/experiment-log.md`
- Learnings applied to:
  - `config/triggers.yaml` — New/retired triggers
  - `config/segments.yaml` — New/retired segments
  - `config/sources.yaml` — New/retired sources

---

## 4. Inputs & Outputs

### 4.1 System Inputs

| Input Type | Source | Format | Used By |
|------------|--------|--------|---------|
| Signal sources | Web, Twitter, LinkedIn, News | URLs in YAML | Signal Scanner |
| Trigger library | Internal | YAML | Target Builder |
| Segment menu | Internal | YAML | Thesis Selector |
| BU positioning | Internal | YAML | Message Generator, Partner Brief |
| Export formats | Internal | YAML | Apollo Exporter |
| Stakeholder routing | Internal | YAML | BU Pack Generator, Partner Brief |
| Pipeline state | Google Sheets | Spreadsheet | Pipeline Syncer, Channel Report |
| Target history | Internal | YAML | Target Builder (dedup) |

### 4.2 System Outputs

| Output Type | Format | Destination | Consumer |
|-------------|--------|-------------|----------|
| Apollo CSV | CSV | Apollo import | SDR teams |
| Message templates | Markdown | Copy-paste / Apollo sequences | SDR teams |
| Partner briefs | PDF | Email / Slack | Partner owners |
| Intro scripts | TXT | Copy-paste | Partner owners |
| Partner decks | PPTX | Email / Drive | Partner owners |
| Slack heartbeat | Markdown | Slack channel | Channel team |
| PDF scoreboard | PDF | Email / Drive | Channel team |
| Slide deck | PPTX | Email / Drive | Channel team |
| Pipeline updates | Spreadsheet | Google Sheets | All stakeholders |

---

## 5. Artifacts

### 5.1 Weekly Artifacts

| Artifact | Frequency | Location | Description |
|----------|-----------|----------|-------------|
| `[date]-bitwage-apollo.csv` | Weekly | `/exports/weekly/[date]/` | Bitwage targets for Apollo import |
| `[date]-bitwage-messages.md` | Weekly | `/exports/weekly/[date]/` | Bitwage message templates |
| `[date]-teampay-apollo.csv` | Weekly | `/exports/weekly/[date]/` | TeamPay targets for Apollo import |
| `[date]-teampay-messages.md` | Weekly | `/exports/weekly/[date]/` | TeamPay message templates |
| `[date]-all-targets-sheet.csv` | Weekly | `/exports/weekly/[date]/` | Full list for Google Sheets import |
| `[date]-weekly-brief.md` | Weekly | `/exports/weekly/[date]/` | Operator summary |

### 5.2 Partner Artifacts

| Artifact | Frequency | Location | Description |
|----------|-----------|----------|-------------|
| `[partner]-brief.pdf` | On-demand | `/exports/partners/[partner]/` | One-page forwardable PDF |
| `[partner]-intro-linkedin.txt` | On-demand | `/exports/partners/[partner]/` | LinkedIn intro message |
| `[partner]-intro-email.txt` | On-demand | `/exports/partners/[partner]/` | Email intro message |
| `[partner]-deck.pptx` | On-request | `/exports/partners/[partner]/` | Partnership overview slides |

### 5.3 Report Artifacts

| Artifact | Frequency | Location | Description |
|----------|-----------|----------|-------------|
| `[date]-slack-heartbeat.md` | Weekly | `/exports/reports/[date]/` | Slack-formatted post |
| `[date]-channel-scoreboard.pdf` | Weekly | `/exports/reports/[date]/` | One-page visual PDF |
| `[date]-channel-slides.pptx` | Weekly | `/exports/reports/[date]/` | 2-3 slide deck |
| `[date]-full-report.md` | Weekly | `/exports/reports/[date]/` | Source document |

### 5.4 Pipeline Artifacts

| Artifact | Frequency | Location | Description |
|----------|-----------|----------|-------------|
| Pipeline Tracker | Continuous | Google Sheets (external) | Single source of truth |
| `target-history.yaml` | Weekly | `/history/` | Dedup log |

---

## 6. Schemas

### 6.1 Apollo CSV Schema

```csv
First Name,Last Name,Email,LinkedIn URL,Company,Title,Company Size,Company HQ,Trigger,Trigger Date,Pain Hypothesis,BU,Notes
```

| Column | Required | Description |
|--------|----------|-------------|
| First Name | Yes | Buyer first name |
| Last Name | Yes | Buyer last name |
| Email | No | Buyer email (flag if missing) |
| LinkedIn URL | Yes | Buyer LinkedIn profile |
| Company | Yes | Company name |
| Title | Yes | Buyer job title |
| Company Size | No | Employee count or range |
| Company HQ | No | Headquarters location |
| Trigger | Yes | Trigger signal that qualifies this target |
| Trigger Date | Yes | Date of trigger signal |
| Pain Hypothesis | Yes | Hypothesized pain point |
| BU | Yes | Bitwage / TeamPay / Mining |
| Notes | No | Additional context for sender |

### 6.2 Google Sheets Pipeline Schema

**Active Pipeline Tab:**

| Column | Description |
|--------|-------------|
| Company | Company name |
| BU | Bitwage / TeamPay / Mining |
| Trigger | Trigger signal |
| State | New / Contacted / Replied / Meeting / Passed |
| Last Touch | Date of most recent action |
| Channel | LinkedIn / Email / Phone / Meeting |
| Next Action | Specific next step |
| Owner | Who is responsible |
| Apollo Link | Link to Apollo contact (if applicable) |
| Notes | Additional context |

**Dashboard Tab:**

| Metric | Formula |
|--------|---------|
| New | `=COUNTIF(State, "New")` |
| Contacted | `=COUNTIF(State, "Contacted")` |
| Replied | `=COUNTIF(State, "Replied")` |
| Meeting | `=COUNTIF(State, "Meeting")` |
| Passed | `=COUNTIF(State, "Passed")` |
| WoW Movement | `=[This Week Total] - [Last Week Total]` |

### 6.3 Trigger Library Schema (YAML)

```yaml
triggers:
  - category: Hiring
    signal: "Posting roles in LATAM, remote-global payroll, international ops"
    best_bu: Bitwage
    age_window_days: 30
    example: "Company X hiring LATAM contractors on LinkedIn"

  - category: Funding
    signal: "Raised capital (especially fintech/crypto/LATAM focused)"
    best_bu: [Bitwage, TeamPay]
    age_window_days: 60
    example: "LATAM payroll startup raises Series A"
```

### 6.4 Stakeholder Routing Schema (YAML)

```yaml
stakeholders:
  - name: Ramiro
    role: Bitwage SDR
    receives: [bitwage-apollo, bitwage-messages]
    channels: [slack:#bitwage-outbound, email]

  - name: Alexandra
    role: Mining Partners
    receives: [mining-targets, partner-briefs:mining]
    channels: [slack:dm, email]

  - name: Christian
    role: Partnerships VP
    receives: [partner-briefs:strategic]
    channels: [slack:dm, email]
```

---

## 7. Routing & Handoffs

### 7.1 Handoff Matrix

| From | To | Artifact | Trigger | Channel |
|------|-----|----------|---------|---------|
| Target Builder | Apollo Exporter | Target list | Auto (after approval) | Internal |
| Apollo Exporter | BU Pack Generator | Apollo CSV | Auto | Internal |
| BU Pack Generator | Ramiro/Jonathan | Bitwage pack | Auto (if targets exist) | Slack + Email |
| BU Pack Generator | Meridith/Morgan | TeamPay pack | Auto (if targets exist) | Slack + Email |
| Partner Brief | Alexandra | Mining brief | On-demand | Slack DM + Email |
| Partner Brief | Christian | Strategic brief | On-demand | Slack DM + Email |
| Channel Report | Channel Team | All formats | Weekly (Friday) | Slack + Email |
| Pipeline Syncer | All | Dashboard update | Continuous | Google Sheets |

### 7.2 Notification Templates

**Slack: BU Pack Ready**
```
🎯 *[BU] Execution Pack Ready — Week of [DATE]*

[N] targets ready for outreach:
• [Company 1] — [Trigger summary]
• [Company 2] — [Trigger summary]
• ...

📎 Files:
• [Apollo CSV link]
• [Messages doc link]

cc: @[Owner]
```

**Slack: Partner Brief Ready**
```
🤝 *Partner Brief Ready: [Partner Name]*

One-page brief + intro scripts attached.
Partner owner: @[Owner]

📎 Files:
• [PDF brief link]
• [Intro scripts link]
```

**Email: Weekly Delivery**
```
Subject: [BU] Execution Pack — Week of [DATE]

Hi [Name],

This week's [BU] targets are attached:
- [N] targets in Apollo CSV format
- Message templates organized by sequence step

Key thesis: [Thesis summary]

Files attached:
- [bu]-apollo.csv
- [bu]-messages.md

Let me know if you have questions.

— Fede
```

---

## 8. Approval Gates

### 8.1 Gate Definitions

| Gate | Location | Approver | Auto-Proceed Condition | Override |
|------|----------|----------|----------------------|----------|
| **Thesis Selection** | After Module 2 | Fede | Top thesis >80% score, others <60% | Always available |
| **Target Validation** | After Module 3 | Fede | All targets have valid triggers | Can remove targets |
| **Message Approval** | After Module 4 | Fede | Messages follow rules | Can edit messages |
| **Partner Brief Send** | After Module 7 | Partner Owner | N/A (always manual send) | N/A |
| **Report Ship** | After Module 9 | Fede | Friday deadline | Can delay |

### 8.2 Gate Workflow

```
Signal Scanner
     │
     ▼
Thesis Selector ──▶ [GATE: Thesis Selection] ──▶ Fede approves/overrides
     │
     ▼
Target Builder ──▶ [GATE: Target Validation] ──▶ Fede validates triggers
     │
     ▼
Message Generator ──▶ [GATE: Message Approval] ──▶ Fede reviews tone/accuracy
     │
     ▼
Apollo Exporter ──▶ BU Pack Generator ──▶ [AUTO: Stakeholder Delivery]
     │
     ▼
Pipeline Syncer ──▶ Channel Report ──▶ [GATE: Report Ship] ──▶ Fede sends
```

### 8.3 Skip & Deprioritize Rules

**Hard Skips (never include):**
- No trigger signal → no target
- No identifiable buyer → skip company
- No clear BU fit → skip company
- Signal has no action mapping → drop from digest
- Partner has no mutual value → skip

**Deprioritize (park for later):**
- Segment has <3 trigger-qualified companies → Thursday research
- Partner requires >3 touchpoints before referral → deprioritize
- Signal "interesting but no conversion path" → log in ecosystem-guide.md

---

## 9. Weekly Operating Cadence

### 9.1 Hybrid Cadence Model

**Core Weekly Cycle:**
- Monday: Signal Scanner → Thesis Selector → (approval) → Target Builder start
- Tuesday: Target Builder finish → Message Generator → Apollo Exporter → BU Pack Generator → Delivery
- Wednesday: Partner Brief (1-2 partners) → Pipeline check-ins
- Thursday: Deep research → Experiment tracking → Knowledge updates
- Friday: Pipeline Syncer → Channel Report → Delivery

**On-Demand Modules:**
- Partner Brief: Any time (for urgent partnership opportunities)
- Signal Scanner: Mid-week (for breaking signals)
- Target Builder: Mid-week (for urgent thesis pivot)

### 9.2 Time Budget (20 hrs/week)

| Day | Hours | Activities |
|-----|-------|------------|
| Monday | 4 | Signal scan, thesis selection, target building start |
| Tuesday | 4 | Target validation, messaging, export, delivery |
| Wednesday | 4 | Partner briefs, partner follow-ups |
| Thursday | 3 | Deep research, experiments, knowledge updates |
| Friday | 3 | Pipeline update, channel report, retrospective |
| On-demand | 2 | Buffer for urgent opportunities |

---

## 10. Build Phases

### Phase 1: Apollo Export Layer (Week 1) — HIGHEST ROI

**Goal:** Eliminate copy-paste into outreach tools.

**Deliverables:**
- `modules/apollo-exporter.md` — Module specification
- `templates/apollo-csv.template` — Column format
- `config/export-formats.yaml` — Field mappings
- BU splitter logic in `modules/bu-pack-generator.md`

**Success Metric:** Import targets to Apollo in <2 minutes.

---

### Phase 2: Google Sheets Pipeline (Week 2) — HIGH ROI

**Goal:** Single source of truth with live visibility.

**Deliverables:**
- Pipeline Tracker template (Google Sheets)
- Dashboard tab with formulas
- Import/export instructions
- Friday update checklist

**Success Metric:** View pipeline state in <30 seconds.

---

### Phase 3: Partner Brief Generator (Week 3) — MEDIUM ROI

**Goal:** Ready-to-forward partner packages.

**Deliverables:**
- `templates/partner-brief.template.pdf` — PDF template
- `templates/partner-intro-linkedin.template` — LinkedIn format
- `templates/partner-intro-email.template` — Email format
- Partner owner routing in `config/stakeholders.yaml`

**Success Metric:** Forward partner intro within 5 minutes.

---

### Phase 4: Channel Report Multi-Surface (Week 4) — MEDIUM ROI

**Goal:** Multi-format reporting for different contexts.

**Deliverables:**
- `templates/slack-heartbeat.template` — Slack format
- `templates/channel-scoreboard.template` — PDF format
- `templates/channel-slides.template.pptx` — Slide format
- `modules/channel-report.md` — Updated module spec

**Success Metric:** Friday report ships in 3 formats with <30 min effort.

---

### Phase 5: Notification Layer (Week 5) — MEDIUM ROI

**Goal:** Push notifications replace file monitoring.

**Deliverables:**
- Slack integration configuration
- Email distribution templates
- `config/stakeholders.yaml` — Routing rules

**Success Metric:** Stakeholders receive packages without asking.

---

### Phase 6: On-Demand Module Triggers (Week 6+) — LOWER ROI

**Goal:** Run any module independently.

**Deliverables:**
- Module trigger interface
- "Run Full Week" chain command
- "Run Single Module" for urgent opportunities

**Success Metric:** Run target builder mid-week for urgent thesis.

---

## 11. Repo Structure

```
bitcoin-ecosystem-growth-os-v3/
├── modules/                           # Modular tool definitions
│   ├── signal-scanner.md
│   ├── thesis-selector.md
│   ├── target-builder.md
│   ├── message-generator.md
│   ├── apollo-exporter.md             # NEW
│   ├── bu-pack-generator.md           # NEW
│   ├── partner-brief.md
│   ├── pipeline-syncer.md             # NEW
│   ├── channel-report.md              # Renamed from exec-report
│   └── experiment-tracker.md
├── config/
│   ├── triggers.yaml                  # Trigger library
│   ├── segments.yaml                  # Segment menu
│   ├── sources.yaml                   # Source URLs
│   ├── bu-positioning.yaml            # BU value props
│   ├── stakeholders.yaml              # NEW: Routing rules
│   └── export-formats.yaml            # NEW: Apollo/Sheets mappings
├── templates/
│   ├── apollo-csv.template            # NEW
│   ├── partner-brief.template.pdf     # NEW
│   ├── partner-intro-linkedin.template # NEW
│   ├── partner-intro-email.template   # NEW
│   ├── channel-scoreboard.template    # NEW
│   ├── channel-slides.template.pptx   # NEW
│   └── slack-heartbeat.template       # NEW
├── knowledge/
│   ├── ecosystem-guide.md
│   ├── experiment-log.md
│   └── learnings.md
├── exports/                           # Generated outputs
│   ├── weekly/
│   │   └── [date]/
│   ├── partners/
│   │   └── [partner]/
│   └── reports/
│       └── [date]/
├── history/
│   └── target-history.yaml
├── bitcoin-ecosystem-growth-os-v3.md  # This file (canonical spec)
└── README.md
```

---

## 12. Migration from v2.1

### 12.1 What to Keep

- All agent logic (thesis selection, trigger validation, messaging rules)
- Knowledge base content (ecosystem guide, experiment log)
- Trigger library and segment menu
- Skip/deprioritize rules
- 5-metric weekly scorecard

### 12.2 What to Change

| v2.1 | v3 |
|------|-----|
| Markdown pipeline tables | Google Sheets |
| Single weekly-test-plan.md | BU-specific packs |
| Day-of-week agents | On-demand modules |
| File-based handoff | Push notifications |
| Exec email only | Multi-surface reports |
| Partner research doc | Forwardable PDF + scripts |

### 12.3 What to Add

- Apollo CSV exporter module
- BU pack generator module
- Partner brief PDF template
- Slack heartbeat template
- Channel scoreboard PDF template
- Channel slides PPTX template
- Stakeholder routing config
- Export format config
- Notification layer

### 12.4 What to Remove

- Day-of-week framing in agent specs
- `knowledge-base/target-pipeline.md` (replaced by Sheets)
- Single `weekly-test-plan.md` format

---

## Appendix A: Trigger Library

| Category | Signal | Best BU | Age Window | Example |
|----------|--------|---------|------------|---------|
| Hiring | LATAM roles, remote payroll | Bitwage | 30 days | "Company hiring LATAM contractors" |
| Expansion | LATAM expansion, new office | Bitwage | 30 days | "Fintech opening São Paulo office" |
| Stablecoin | USDC/USDT integration | Bitwage | 30 days | "Payment provider adding USDC rails" |
| BTC Treasury | BTC purchase, treasury policy | TeamPay | 60 days | "Company adds $20M BTC to balance sheet" |
| Event | Speaking/sponsoring at event | TeamPay, Bitwage | 30 days | "CEO speaking at LABITCONF" |
| Funding | Raised capital | TeamPay, Bitwage | 60 days | "LATAM startup raises Series A" |
| Pain Signal | FX complaints, payment friction | Bitwage | 30 days | "CFO quoted on cross-border friction" |
| Partnership | Ecosystem partnership announced | Mining, TeamPay | 30 days | "Mining op partners with energy provider" |
| Regulatory | Regulation enabling crypto payments | Bitwage | 30 days | "Brazil stablecoin regulation finalized" |
| Community | Active in BTC/fintech communities | TeamPay | 30 days | "Founder active on Bitcoin Twitter" |

---

## Appendix B: Segment Menu

| Segment | Primary BU | Typical Buyer | Why High-Probability |
|---------|-----------|---------------|---------------------|
| LATAM-expanding fintechs | Bitwage | CFO, VP Finance | Direct pain alignment |
| Remote contractors MX/BR/CO/AR | Bitwage | Head of People | Active FX friction |
| Bitcoin-native companies | TeamPay | CFO, Founder | BTC card wedge |
| Stablecoin payment providers | Bitwage | Head of Partnerships | Partnership + customer |
| Mining multi-country payments | Mining, Bitwage | CFO, Ops Director | Cross-border pain |
| LATAM fintech event attendees | Bitwage, TeamPay | CFO, Founder | Warm intro path |
| NGOs / circular economy | Foundation | Program Director | Mission alignment |
| BTC/stablecoin integration announcements | TeamPay | CFO, CTO | Timing-driven |

---

*Generated by Bitcoin Ecosystem Growth OS v3.0*
