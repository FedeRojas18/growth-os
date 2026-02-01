# Growth OS Agent Workflow Specification

> **Version:** 4.0
> **Architecture:** Event-driven agent pipeline
> **Philosophy:** Agents execute when upstream dependencies complete, not on calendar days

---

## System Overview

Growth OS is a modular agent pipeline that transforms ecosystem signals into qualified sales targets. Each agent has explicit inputs, outputs, and trigger conditions. The system runs continuously — not in weekly batches.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GROWTH OS AGENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   SIGNAL     │────▶│    THESIS    │────▶│   TARGET     │                │
│  │   SCANNER    │     │   SELECTOR   │     │   BUILDER    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         │                    │                    ▼                         │
│         │                    │            ┌──────────────┐                  │
│         │                    │            │  MESSAGING   │                  │
│         │                    │            │   DRAFTER    │                  │
│         │                    │            └──────────────┘                  │
│         │                    │                    │                         │
│         │                    │                    ▼                         │
│         │                    │            ┌──────────────┐                  │
│         │                    │            │    EXPORT    │                  │
│         │                    │            │    AGENT     │                  │
│         │                    │            └──────────────┘                  │
│         │                    │                    │                         │
│         │                    │                    ▼                         │
│         │                    │            ┌──────────────┐                  │
│         │                    │            │  DASHBOARD   │                  │
│         │                    │            │    SYNC      │                  │
│         │                    │            └──────────────┘                  │
│         │                    │                                              │
│         │                    │            ┌──────────────┐                  │
│         └────────────────────┴───────────▶│  INSIGHTS    │                  │
│                                           │    AGENT     │                  │
│                                           └──────────────┘                  │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │   PARTNER    │  (Independent pipeline — triggered by partner signals)   │
│  │    AGENT     │                                                          │
│  └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. Event-Driven Execution
Agents run when their **trigger conditions** are met, not on specific days. A trigger can be:
- Upstream agent completion
- New signal detection
- Human approval
- State change in pipeline
- Time-based threshold (e.g., "14 days since last scan")

### 2. Explicit Contracts
Every agent has:
- **Inputs**: What it needs to run
- **Outputs**: What it produces
- **Trigger**: What causes it to run
- **Approval Gate**: Whether human approval is required before downstream execution

### 3. Continuous Operation
The pipeline can process signals at any time. Multiple thesis cycles can run in parallel. There is no "weekly batch" — only completed cycles and active cycles.

### 4. Source of Truth
- **Markdown files** (`KNOWLEDGE/`) are the canonical source for targets and partners
- **SQLite/Turso** stores operational metadata (activities, reminders, state overrides)
- **Dashboard API** merges both at runtime

---

## Agent Specifications

---

### Agent 1: Signal Scanner

**Purpose**: Scan configured sources for actionable ecosystem signals.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `on_demand` | Operator requests a scan |
| `scheduled` | Configurable interval (default: every 72 hours) |
| `breaking_signal` | Ad-hoc scan for specific event or news |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Source configuration | `config/sources.yaml` | Yes |
| Ecosystem context | `KNOWLEDGE/ecosystem-guide.md` | Yes |
| Trigger library | `config/triggers.yaml` | Yes |
| Previous digest | Last signal digest (for continuity) | No |

#### Process
1. **Scan** all sources in `config/sources.yaml`
2. **Filter** by recency (default <7 days, funding <60 days, regulatory <30 days)
3. **Validate** against trigger library categories
4. **Classify** each signal:
   - `thesis_candidate` — suggests new segment opportunity
   - `trigger_target` — specific company with actionable trigger
   - `partner_lead` — partnership opportunity
   - `drop` — interesting but no clear action
5. **Apply guardrails**: Signal density ≥3 companies, buyer clarity, path to pipeline
6. **Generate** digest with action mapping

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Signal Digest | Markdown | `WORK/signals/{timestamp}-signal-digest.md` |
| Action Mapping | Table in digest | Embedded |
| Recommended Action | Text | Embedded |

#### Approval Gate
**Yes** — Human reviews digest and selects action before triggering downstream agents.

#### Downstream Triggers
- If `thesis_candidate` selected → Trigger **Thesis Selector**
- If `trigger_target` selected → Trigger **Target Builder** (skip thesis selection)
- If `partner_lead` selected → Trigger **Partner Agent**

---

### Agent 2: Thesis Selector

**Purpose**: Rank segment/thesis options and recommend the highest-probability targeting approach.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `signal_digest_approved` | Signal Scanner digest reviewed, thesis candidates identified |
| `operator_request` | Manual thesis evaluation requested |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Signal Digest | Signal Scanner output | Yes |
| Segment Menu | `config/segments.yaml` | Yes |
| Trigger Library | `config/triggers.yaml` | Yes |
| Pipeline state | `KNOWLEDGE/target-pipeline.md` | No |
| Historical performance | Previous thesis results | No |

#### Process
1. **Extract** thesis candidates from signal digest
2. **Cross-reference** with segment menu and trigger library
3. **Apply scope guardrails**:
   - Signal density ≥3 companies with active triggers
   - Buyer persona identifiable (job title)
   - Path to pipeline within 2 weeks
4. **Score** each thesis option:

| Factor | Weight |
|--------|--------|
| Signal density | 30% |
| Trigger strength | 25% |
| BU priority alignment | 20% |
| Conversion history | 15% |
| Research effort | 10% |

5. **Rank** and present top 3 options with rationale

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Thesis Options | Markdown with scoring | `WORK/thesis/{timestamp}-thesis-options.md` |
| Recommended Thesis | Highlighted in output | Embedded |
| Excluded Segments | Table with reasons | Embedded |

#### Approval Gate
**Yes** — Human selects final thesis before triggering Target Builder.

#### Downstream Triggers
- Thesis selected → Trigger **Target Builder** with selected thesis

---

### Agent 3: Target Builder

**Purpose**: Research and produce trigger-qualified target list with enrichment data.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `thesis_selected` | Thesis Selector output approved by human |
| `direct_trigger_targets` | Signal Scanner identified direct targets (bypass thesis) |
| `operator_request` | Manual target research for specific segment |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Selected Thesis | Thesis Selector output or operator input | Yes |
| Trigger Targets | Signal Scanner (if direct targets) | Conditional |
| Trigger Library | `config/triggers.yaml` | Yes |
| Target History | `KNOWLEDGE/target-history.md` | Yes |
| Active Pipeline | `KNOWLEDGE/target-pipeline.md` | Yes |

#### Process
1. **Ingest** thesis parameters: segment, BU fit, best triggers, buyer persona
2. **Extract** any pre-qualified trigger targets from signal digest
3. **Research** additional targets from:
   - LinkedIn (job postings, company pages)
   - Crunchbase (funding, expansion)
   - Twitter/X (executive activity)
   - Industry news
   - Event speaker/sponsor lists
4. **Validate** each target:
   - Has valid trigger from Trigger Library
   - Trigger within age window
   - Identifiable buyer (name + title preferred)
   - Clear BU fit
   - Not in target-history.md (dedup)
   - Not already in active pipeline
5. **Enrich** qualified targets with full data
6. **Limit** to 10-15 targets (rank by trigger strength if >15)

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Target List | Enriched markdown table | `WORK/targets/{timestamp}-target-list.md` |
| Skipped Companies | Transparency log | Embedded |
| Dedup Additions | New entries | `KNOWLEDGE/target-history.md` |
| Pipeline Additions | New entries (state=New) | `KNOWLEDGE/target-pipeline.md` |

#### Approval Gate
**Yes** — Human reviews target list before triggering Messaging Drafter.

#### Downstream Triggers
- Target list approved → Trigger **Messaging Drafter**

---

### Agent 4: Messaging Drafter

**Purpose**: Generate personalized outreach messages connecting target pain to product value.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `target_list_approved` | Target Builder output approved by human |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Target List | Target Builder output | Yes |
| BU Positioning | `config/bu-positioning.yaml` | Yes |
| Trigger Library | `config/triggers.yaml` | Yes |

#### Process
1. **Build** pain-to-product mapping for the thesis segment
2. **Draft** 2-3 variants per target:
   - **Pain-led**: Lead with specific pain point
   - **Trigger-led**: Lead with the trigger signal
   - **Social proof**: Lead with similar company success (if available)
3. **Apply** messaging rules:
   - Email <150 words, LinkedIn <75 words
   - No banned phrases (see messaging rules)
   - Specific CTA (time slot, one-pager, Loom)
   - Rotate proof points across messages
4. **Format** for handoff with sender notes

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Message Variants | Markdown per target | `WORK/messages/{timestamp}-messages.md` |
| Pain-to-Product Map | Reference table | Embedded |
| Sender Notes | Context per target | Embedded |

#### Approval Gate
**Optional** — Human can review/edit messages or proceed directly.

#### Downstream Triggers
- Messages complete → Trigger **Export Agent**

---

### Agent 5: Export Agent

**Purpose**: Transform targets + messages into import-ready formats and split by Business Unit.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `messages_complete` | Messaging Drafter output ready |
| `messages_approved` | If human review was requested |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Target List | Target Builder output | Yes |
| Messages | Messaging Drafter output | Yes |
| Export Schema | `config/export-formats.yaml` | Yes |
| Stakeholder Routing | `config/stakeholders.yaml` | Yes |

#### Process
1. **Validate** data completeness:
   - Required: First Name, Last Name, Company, Title, LinkedIn URL, Trigger, Trigger Date, Pain Hypothesis, BU
   - Flag if missing: Email, Company Size, Company HQ
   - Skip if missing: Buyer name, LinkedIn URL, valid trigger
2. **Transform** to Apollo CSV schema
3. **Split** by Business Unit:
   - Bitwage targets → `bitwage-apollo.csv`
   - TeamPay targets → `teampay-apollo.csv`
   - Mining targets → `mining-apollo.csv`
4. **Generate** sequence messages by BU
5. **Create** validation report with enrichment gaps
6. **Generate** operator brief with routing instructions

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| All Targets CSV | Apollo CSV | `EXPORTS/{cycle-id}/all-targets.csv` |
| BU-specific CSVs | Apollo CSV | `EXPORTS/{cycle-id}/{bu}-apollo.csv` |
| BU-specific Messages | Markdown | `EXPORTS/{cycle-id}/{bu}-messages.md` |
| Validation Report | Markdown | `EXPORTS/{cycle-id}/validation-report.md` |
| Operator Brief | Markdown | `EXPORTS/{cycle-id}/brief.md` |

#### Approval Gate
**No** — Automatic execution after upstream completion.

#### Downstream Triggers
- Export complete → Trigger **Dashboard Sync**
- Export complete → Notify stakeholders per routing rules

---

### Agent 6: Dashboard Sync

**Purpose**: Sync new targets to dashboard and update pipeline state.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `export_complete` | Export Agent finished |
| `state_change` | Pipeline state updated (manual or via dashboard) |
| `scheduled` | Periodic sync (every 6 hours) |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Target Pipeline | `KNOWLEDGE/target-pipeline.md` | Yes |
| Partner Pipeline | `KNOWLEDGE/partnership-pipeline.md` | Yes |
| State Overrides | SQLite `stateOverrides` table | Yes |
| Activity Log | SQLite `activities` table | Yes |
| Reminders | SQLite `reminders` table | Yes |

#### Process
1. **Parse** markdown pipeline files
2. **Query** database for overrides and activities
3. **Merge** markdown + database records
4. **Compute** derived metrics:
   - Targets by state
   - State changes (vs. last sync)
   - Stale targets (>14 days without touch)
   - Overdue reminders
5. **Update** dashboard API cache
6. **Generate** sync report

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Dashboard Data | JSON via API | `/api/targets`, `/api/partners` |
| Sync Report | Markdown | `WORK/sync/{timestamp}-sync-report.md` |
| Stale Alerts | List | Embedded in report |

#### Approval Gate
**No** — Automatic execution.

#### Downstream Triggers
- Sync complete → Dashboard updates in real-time
- Stale targets detected → Alert operator

---

### Agent 7: Insights Agent

**Purpose**: Aggregate data and generate executive-ready reports and metrics.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `report_request` | Operator requests exec update or insights |
| `cycle_complete` | Full pipeline cycle completed |
| `scheduled` | Configurable interval (default: every 7 days) |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Target Pipeline | `KNOWLEDGE/target-pipeline.md` | Yes |
| Partner Pipeline | `KNOWLEDGE/partnership-pipeline.md` | Yes |
| Activity Log | SQLite `activities` table | Yes |
| Signal Digests | Recent digests | Yes |
| ROI Metrics | `KNOWLEDGE/roi-metrics.md` | Yes |

#### Process
1. **Calculate** 5-metric scorecard:

| Metric | Target | Scoring |
|--------|--------|---------|
| Test plan shipped | Yes per cycle | ✓/✗ |
| Targets added to pipeline | 10-15 per cycle | Count |
| Pipeline state changes | ≥3 per cycle | Count |
| Partner conversations advanced | 1-2 per cycle | Count |
| Exec update shipped | Yes per cycle | ✓/✗ |

2. **Summarize** wins (outcomes, not activity):
   - Meetings booked
   - Replies received
   - Partner intros made
   - Logos added
3. **Snapshot** pipeline state with changes
4. **Extract** key ecosystem signals with strategic implications
5. **Preview** next cycle focus
6. **Surface** blockers requiring leadership input

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Exec Update | Email-ready markdown | `EXPORTS/reports/{timestamp}-exec-update.md` |
| Scorecard | 5-metric table | Embedded |
| Pipeline Snapshot | State counts + changes | Embedded |
| Digest Summary | Weekly markdown | Dashboard `/api/digest` |

#### Approval Gate
**Yes** — Human reviews and edits before sending to leadership.

#### Downstream Triggers
- Approved → Send to configured stakeholders
- Approved → Archive to `EXPORTS/reports/`

---

### Agent 8: Partner Agent

**Purpose**: Research potential channel partners and produce partnership one-pagers.

#### Trigger Conditions
| Condition | Description |
|-----------|-------------|
| `partner_lead_identified` | Signal Scanner flagged partner opportunity |
| `operator_request` | Manual partner research requested |

#### Inputs
| Input | Location | Required |
|-------|----------|----------|
| Partner Prospect | Signal Scanner or operator input | Yes |
| BU Positioning | `config/bu-positioning.yaml` | Yes |
| Partnership Pipeline | `KNOWLEDGE/partnership-pipeline.md` | Yes |

#### Process
1. **Research** partner basics:
   - Company overview, size, stage
   - Key leadership and decision-makers
   - Recent news and partnerships
2. **Assess** strategic fit:
   - Audience overlap with BU customers
   - Value exchange (what each party gains)
   - BU fit and competitive landscape
3. **Apply** skip rules:
   - No mutual value → Skip
   - Direct competitor → Skip
   - Exclusive competitor partnership → Skip
   - No path to intro → Skip
4. **Define** mutual value proposition
5. **Craft** intro script (3-4 sentences)
6. **Produce** one-pager with next steps

#### Outputs
| Output | Format | Location |
|--------|--------|----------|
| Partner One-Pager | Markdown | `WORK/partners/{partner-name}-brief.md` |
| Pipeline Update | New entry | `KNOWLEDGE/partnership-pipeline.md` |

#### Approval Gate
**Yes** — Human approves before outreach.

#### Downstream Triggers
- Approved → Update partnership pipeline
- Approved → Notify relevant stakeholders

---

## Pipeline Cycle Definition

A **cycle** is one complete pass through the core agent pipeline:

```
Signal Scanner → Thesis Selector → Target Builder → Messaging Drafter → Export Agent → Dashboard Sync
```

### Cycle States

| State | Description |
|-------|-------------|
| `initiated` | Signal Scanner started |
| `signals_ready` | Digest complete, awaiting human review |
| `thesis_selected` | Human selected thesis, Target Builder triggered |
| `targets_ready` | Target list complete, awaiting human review |
| `messages_ready` | Messages complete, proceeding to export |
| `exported` | CSVs generated, dashboard synced |
| `complete` | Full cycle finished, metrics updated |

### Cycle Metadata

Each cycle is tracked with:
```yaml
cycle_id: "2026-01-31-001"
initiated_at: "2026-01-31T09:00:00Z"
current_state: "targets_ready"
thesis: "LATAM Fintech Series A Recipients"
target_count: 12
bu_distribution:
  bitwage: 8
  teampay: 3
  mining: 1
```

---

## Data Flow Architecture

### Source of Truth Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    MARKDOWN (Primary)                       │
│  KNOWLEDGE/target-pipeline.md     - Target data             │
│  KNOWLEDGE/partnership-pipeline.md - Partner data           │
│  KNOWLEDGE/target-history.md      - Dedup log               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Parsed by API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Overrides)                     │
│  stateOverrides    - State + lastTouch updates              │
│  nextActionOverrides - Manual next action edits             │
│  activities        - Notes, calls, emails, state changes    │
│  reminders         - Follow-up dates                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Merged at runtime
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD API                            │
│  /api/targets      - Merged target data                     │
│  /api/partners     - Merged partner data                    │
│  /api/metrics      - Scorecard metrics                      │
│  /api/digest       - Weekly summary                         │
│  /api/activities   - Activity log                           │
│  /api/reminders    - Reminder management                    │
└─────────────────────────────────────────────────────────────┘
```

### Target States

```
New → Contacted → Replied → Meeting → Passed (to sales)
                                   ↘ Closed-Lost (archive)
                                   ↘ Nurture (90-day hold)
```

| State | Max Duration | Next Action |
|-------|--------------|-------------|
| New | 7 days | Contact via selected channel |
| Contacted | 14 days | Follow up or escalate |
| Replied | 14 days | Schedule meeting |
| Meeting | 14 days | Qualify and pass to sales |
| Nurture | 90 days | Re-engage when timing right |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `config/sources.yaml` | Signal sources with scan instructions |
| `config/triggers.yaml` | Valid triggers with age windows |
| `config/segments.yaml` | Pre-vetted targeting segments |
| `config/bu-positioning.yaml` | BU value propositions |
| `config/stakeholders.yaml` | Routing rules and contacts |
| `config/export-formats.yaml` | Apollo CSV schema |

---

## Invocation Commands

### Start a New Cycle
```
"Run Signal Scanner"
"Scan for signals"
"Start a new cycle"
```

### Select Thesis
```
"Select thesis from the signal digest"
"Evaluate thesis options"
"I want to pursue [thesis name]"
```

### Build Targets
```
"Build target list for [thesis]"
"Research targets for [segment]"
"Find companies matching [criteria]"
```

### Generate Messages
```
"Draft messages for the target list"
"Generate outreach for [company]"
```

### Export
```
"Generate Apollo export"
"Create BU packs"
"Export to CSV"
```

### Reports
```
"Generate exec update"
"Show pipeline insights"
"What's the current scorecard?"
```

### Partners
```
"Research [partner name] as a potential partner"
"Create partner brief for [company]"
```

---

## Success Metrics

### Per-Cycle Metrics
| Metric | Target |
|--------|--------|
| Targets added | 10-15 |
| Targets with valid triggers | 100% |
| Message variants generated | 2-3 per target |
| Export validation pass | 100% required fields |

### Rolling Metrics (tracked by Insights Agent)
| Metric | Target |
|--------|--------|
| Pipeline state changes | ≥3 per cycle |
| Partner conversations | 1-2 per cycle |
| Reply rate | >5% for segment |
| Meeting conversion | 1-2 per cycle |

### Health Indicators
| Indicator | Yellow | Red |
|-----------|--------|-----|
| Targets added | <10 | <5 |
| Pipeline movement | 1-2 changes | 0 changes |
| Stale targets | >5 (14+ days) | >10 (14+ days) |
| Cycle duration | >5 days | >7 days |

---

## Skip Rules (Global)

### Hard Skips (Never Include)
- No trigger signal → Skip
- Trigger outside age window → Skip
- No identifiable buyer → Skip
- No clear BU fit → Skip
- Already in active pipeline → Skip
- Contacted in past 90 days → Skip

### Deprioritize (Include Only If Needed)
- Trigger 25-30 days old → Rank lower
- Only job title, no name → Rank lower
- Company <10 employees (unless Bitcoin-native) → Rank lower
- Buyer is junior title → Rank lower

### Escalate to Human
- Trigger is ambiguous → Flag for review
- Target was contacted >90 days ago → Ask if retry
- Target is known competitor or partner → Flag
- High-profile partner requiring exec involvement → Escalate

---

## File Structure

```
growth-os/
├── SYSTEM/
│   ├── AGENT-WORKFLOW.md          ← This file
│   ├── agents/                    ← Individual agent specs (legacy)
│   ├── modules/                   ← Module specs (legacy)
│   ├── config/                    ← All YAML configuration
│   └── skills/                    ← Custom skills
│
├── KNOWLEDGE/                     ← Source of truth
│   ├── target-pipeline.md
│   ├── partnership-pipeline.md
│   ├── target-history.md
│   ├── ecosystem-guide.md
│   └── roi-metrics.md
│
├── WORK/                          ← Active work products
│   ├── signals/                   ← Signal digests
│   ├── thesis/                    ← Thesis options
│   ├── targets/                   ← Target lists
│   ├── messages/                  ← Message drafts
│   ├── partners/                  ← Partner briefs
│   └── sync/                      ← Sync reports
│
├── EXPORTS/                       ← Deliverables
│   ├── {cycle-id}/                ← Per-cycle exports
│   │   ├── all-targets.csv
│   │   ├── bitwage-apollo.csv
│   │   ├── teampay-apollo.csv
│   │   ├── mining-apollo.csv
│   │   ├── *-messages.md
│   │   ├── validation-report.md
│   │   └── brief.md
│   └── reports/                   ← Exec updates
│
└── dashboard/                     ← Frontend + API
    ├── api/                       ← Vercel serverless
    ├── server/                    ← Express dev server
    └── src/                       ← React frontend
```

---

## Migration Notes

### From Day-Based to Event-Driven

| Old (Day-Based) | New (Event-Driven) |
|-----------------|-------------------|
| "Monday: Signal Scanner" | Signal Scanner triggers on demand or every 72 hours |
| "Tuesday: Target Builder" | Target Builder triggers when thesis is selected |
| "Wednesday: Partners" | Partner Agent triggers when partner lead identified |
| "Friday: Exec Update" | Insights Agent triggers on request or when cycle completes |

### Parallel Execution
Multiple cycles can run simultaneously:
- Cycle A: In `targets_ready` state, awaiting review
- Cycle B: In `signals_ready` state, thesis being selected
- Partner research: Running independently

### Backwards Compatibility
The old day-based workflow can still be followed manually by invoking agents in sequence. The new system simply removes the requirement to do so.

---

## Quick Reference: Agent Triggers

| Agent | Trigger | Approval Gate | Downstream |
|-------|---------|---------------|------------|
| Signal Scanner | On-demand, scheduled (72h), breaking signal | Yes | Thesis Selector, Target Builder, Partner Agent |
| Thesis Selector | Signal digest approved | Yes | Target Builder |
| Target Builder | Thesis selected, direct targets | Yes | Messaging Drafter |
| Messaging Drafter | Target list approved | Optional | Export Agent |
| Export Agent | Messages complete | No | Dashboard Sync |
| Dashboard Sync | Export complete, state change, scheduled (6h) | No | — |
| Insights Agent | Report request, cycle complete, scheduled (7d) | Yes | Stakeholder notification |
| Partner Agent | Partner lead identified, operator request | Yes | Pipeline update |
