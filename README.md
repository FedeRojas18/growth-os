# Bitcoin Ecosystem Growth OS v2.1

> **Quick Start Guide for Operators**

---

## What Is This?

This repo contains the operating system for Paystand's Bitcoin Ecosystem Channel. It's a research-to-outreach-plan pipeline that produces weekly test plans, partner one-pagers, and executive updates.

**Core insight:** The JGA (Fede) produces intelligence, target lists, messaging, and partnership recommendations. A TeamPay team member executes outreach. AI agents automate the research-synthesis-formatting loop while keeping strategic judgment human.

---

## Quick Start (First Week)

### Day 1: Setup
1. Read `bitcoin-ecosystem-growth-os-v2.1.md` (the full spec)
2. Populate `knowledge-base/sources.md` with your actual source URLs
3. Review `knowledge-base/roi-metrics.md` to understand success metrics

### Day 2-5: First Weekly Cycle
Follow the daily cadence below.

---

## Weekly Operating Cadence

### Monday (4 hrs) — Intelligence + Thesis

| Time | Action | Agent | Output |
|------|--------|-------|--------|
| 30 min | Run Ecosystem Intelligence Monitor | `agents/ecosystem-intelligence.md` | Signal digest with action mapping |
| 30 min | Review digest, run Segment Thesis Selector | `agents/segment-thesis-selector.md` | 3 ranked thesis options |
| 30 min | Select thesis, trigger Target List Builder | Human decision | Selected thesis |
| 1.5 hrs | Begin reviewing Target List Builder output | `agents/target-list-builder.md` | Draft target list |
| 1 hr | Partnership pipeline check-ins | Manual | Partner status updates |

### Tuesday (4 hrs) — Test Plan Assembly

| Time | Action | Agent | Output |
|------|--------|-------|--------|
| 1.5 hrs | Finalize Target List Builder output | `agents/target-list-builder.md` | Final 10-15 targets |
| 1.5 hrs | Run Messaging Drafter, review + refine | `agents/messaging-drafter.md` | 2-3 message variants per target |
| 45 min | Assemble weekly test plan | Use `templates/weekly-test-plan.md` | `/weekly-plans/YYYY-MM-DD-weekly-test-plan.md` |
| 15 min | Update target-history.md + target-pipeline.md | Manual | Dedup + pipeline updated |

**CORE DELIVERABLE:** Weekly test plan shipped every Tuesday.

### Wednesday (4 hrs) — Partnerships

| Time | Action | Agent | Output |
|------|--------|-------|--------|
| 1.5 hrs | Research new partner prospects | Manual research | Partner candidates |
| 1 hr | Run Partner One-Pager for 1-2 targets | `agents/partner-one-pager.md` | Partner one-pagers |
| 1 hr | Follow up on existing partner conversations | Manual | Partner status updates |
| 30 min | Ad-hoc enablement requests | As needed | — |

### Thursday (3 hrs) — Deep Research + Experiments

| Time | Action | Output |
|------|--------|--------|
| 1.5 hrs | Deep-dive on next week's thesis candidates | Thesis options for next Monday |
| 45 min | Update ecosystem knowledge base | `knowledge-base/ecosystem-guide.md` updated |
| 45 min | Experiment tracking + results documentation | `knowledge-base/experiment-log.md` updated |

### Friday (3 hrs) — Exec Update + Planning

| Time | Action | Agent | Output |
|------|--------|-------|--------|
| 45 min | Run Weekly Exec Update agent, review + refine | `agents/weekly-exec-update.md` | Draft exec update |
| 30 min | Ship exec update email | Manual send | Email to leadership |
| 30 min | Update target-pipeline.md, review roi-metrics scorecard | Manual | Pipeline and ROI updated |
| 30 min | Week retrospective | Manual | Learnings documented |
| 45 min | Pre-plan next week | Manual | Monday sources queued |

**CORE DELIVERABLE:** Exec update shipped every Friday.

---

## Repo Structure

```
bitcoin-ecosystem-analysis/
├── agents/                          ← Agent procedures + decision rules
│   ├── ecosystem-intelligence.md    ← Agent 1: Monday signal digest
│   ├── segment-thesis-selector.md   ← Agent 2: Thesis proposals
│   ├── target-list-builder.md       ← Agent 3: Target research
│   ├── messaging-drafter.md         ← Agent 4: Outreach messaging
│   ├── partner-one-pager.md         ← Agent 5: Partnership artifacts
│   └── weekly-exec-update.md        ← Agent 6: Friday leadership email
├── templates/                       ← Output templates
│   ├── weekly-test-plan.md          ← Test plan format
│   ├── weekly-exec-update.md        ← Exec update format
│   └── partner-one-pager.md         ← Partner brief format
├── knowledge-base/                  ← Living knowledge files
│   ├── sources.md                   ← Source list for Agent 1
│   ├── roi-metrics.md               ← ROI definitions + scorecard
│   ├── target-pipeline.md           ← Target state tracking
│   ├── ecosystem-guide.md           ← Ecosystem knowledge
│   ├── target-history.md            ← Dedup log
│   ├── partnership-pipeline.md      ← Partner tracking
│   └── experiment-log.md            ← Growth experiment tracking
├── weekly-plans/                    ← Weekly outputs (accumulate here)
│   └── (YYYY-MM-DD-weekly-test-plan.md files)
├── bitcoin-ecosystem-growth-os-v2.1.md  ← Canonical spec (source of truth)
└── README.md                        ← This file
```

---

## Key Files to Know

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `bitcoin-ecosystem-growth-os-v2.1.md` | Canonical spec — do not modify without approval | Rarely |
| `knowledge-base/sources.md` | What to scan on Monday | Weekly |
| `knowledge-base/target-pipeline.md` | Where targets are in the funnel | Tue + Fri |
| `knowledge-base/roi-metrics.md` | What success looks like | Review Fri |
| `weekly-plans/*.md` | Weekly test plans | New every Tue |

---

## 5 Weekly Metrics (Reported Every Friday)

| # | Metric | Target |
|---|--------|--------|
| 1 | Test plan shipped | Yes every Tuesday |
| 2 | Targets added to pipeline | 10-15/week |
| 3 | Pipeline state changes | ≥3/week |
| 4 | Partner conversations advanced | 1-2/week |
| 5 | Exec update shipped | Yes every Friday |

**Scoring:** 5/5 = Great week | 4/5 = Acceptable | 3/5 or below = Red flag

---

## Skip / Deprioritize Rules

These rules apply across ALL agents:

### Hard Skips (never include)
- No trigger signal → no target
- No identifiable buyer → skip company
- No clear BU fit → skip company
- Signal has no action mapping → drop from digest
- Partner has no mutual value → skip

### Deprioritize (park for later)
- Segment has <3 trigger-qualified companies → Thursday research, not Tuesday plan
- Partner requires >3 touchpoints before referral path → deprioritize
- Signal is "interesting but no conversion path" → log in ecosystem-guide.md, don't action

---

## Before You Start Each Week

### Monday Morning Checklist
- [ ] Sources.md is up to date
- [ ] Previous week's pipeline states updated
- [ ] Any learnings from last week applied to Trigger Library / Segment Menu

### Friday EOD Checklist
- [ ] Exec update sent
- [ ] Pipeline states updated
- [ ] Scorecard calculated (5 metrics)
- [ ] Learnings documented
- [ ] Next week sources queued

---

## Troubleshooting

| If This Happens | Do This |
|-----------------|---------|
| Agent 1 produces <5 signals | Check sources.md URLs; expand source list |
| Agent 3 produces targets without triggers | Reject and re-run with stricter validation |
| Agent 3 produces >15 targets | Remove lowest-priority until 10-15 remain |
| Tuesday test plan not shipped | Ship partial plan; identify blocker in Friday retro |
| Friday exec update not shipped | Ship abbreviated version immediately; investigate |
| Pipeline movement = 0 for 2 weeks | Stop adding new targets; focus on advancing existing |
| Reply rate <5% for segment after 2 weeks | Retire or refine the segment |

---

## 90-Day Goals

1. Weekly test plans shipped consistently
2. 2-3 growth experiments run
3. Channel partnerships producing 10 organic referrals
4. Consistent weekly leadership reporting

---

## Questions?

- Review `bitcoin-ecosystem-growth-os-v2.1.md` for full spec
- Check agent files in `/agents/` for detailed procedures
- Check templates in `/templates/` for output formats
