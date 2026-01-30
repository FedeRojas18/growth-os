# Agent 6: Weekly Exec Update

> **Run Day:** Friday
> **Time Budget:** 45 min agent run + 30 min human review + 30 min shipping
> **What It Automates:** Data aggregation, pipeline snapshot, signal summary
> **What Stays Human:** Narrative framing, strategic asks, blocker escalation

---

## Purpose

Aggregate the week's outputs, pipeline state, and key signals into a leadership email that demonstrates progress, surfaces blockers, and previews next week. This is the primary visibility mechanism for the 20-hour/week investment.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Weekly test plan | `/weekly-plans/YYYY-MM-DD-weekly-test-plan.md` | Yes |
| Pipeline snapshot | `knowledge-base/target-pipeline.md` | Yes |
| ROI metrics | `knowledge-base/roi-metrics.md` | Yes |
| Partner activity | `knowledge-base/partnership-pipeline.md` | Yes |
| Signal digest | Agent 1 output from Monday | Yes |
| Previous exec updates | `communications/` (for quality bar) | Optional |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| Weekly Exec Update Email | Formatted email ready to send | Leadership |
| Weekly Scorecard | 5 metrics summary | Embedded in email |

---

## Step-by-Step Procedure

### Step 1: Gather Metrics
Pull data for the 5-metric weekly scorecard:

| # | Metric | Target | This Week |
|---|--------|--------|-----------|
| 1 | Test plan shipped | Yes every Tuesday | [Yes/No] |
| 2 | Targets added to pipeline | 10-15/week | [Number] |
| 3 | Pipeline state changes | ≥3/week | [Number] |
| 4 | Partner conversations advanced | 1-2/week | [Number] |
| 5 | Exec update shipped | Yes every Friday | [Yes — this is it] |

**Scoring:** 5/5 = Great week | 4/5 = Acceptable | 3/5 or below = Red flag

### Step 2: Summarize Wins
Identify 2-3 concrete wins from the week:
- Meetings booked
- Replies received
- Partner intros made
- Logos added to pipeline
- Event connections confirmed

**Win criteria:** Something that moved the pipeline or advanced a relationship — not activity completed.

### Step 3: Pipeline Snapshot
Pull current state from `target-pipeline.md`:

| State | Count | Change vs. Last Week |
|-------|-------|---------------------|
| New | [#] | [+/- #] |
| Contacted | [#] | [+/- #] |
| Replied | [#] | [+/- #] |
| Meeting | [#] | [+/- #] |
| Passed | [#] | [+/- #] |

Highlight:
- Notable movements (e.g., "Company X moved from Contacted → Meeting")
- Stalls (e.g., "3 targets stuck in Contacted for 2 weeks — need follow-up strategy")

### Step 4: Key Signals
Summarize 2-3 signals from Monday digest that have strategic implications:
- What's happening in the ecosystem?
- What does it mean for our positioning?
- Any signals requiring leadership input?

### Step 5: Next Week Preview
State next week's thesis and expected activities:
- Thesis selected for next week
- Key targets to watch
- Partner conversations scheduled
- Events coming up

### Step 6: Blockers / Asks
Surface any blockers or requests for leadership:
- Resources needed
- Decisions required
- Introductions requested
- Strategic questions

**Note:** This section is human-edited. Agent flags potential blockers, human frames the ask.

### Step 7: Format Email
Produce email in this format:

```markdown
Subject: Bitcoin Ecosystem Growth — Week of [DATE] Update

---

## Weekly Scorecard

| Metric | Target | This Week | Status |
|--------|--------|-----------|--------|
| Test plan shipped | Yes | [Yes/No] | [checkmark/x] |
| Targets added to pipeline | 10-15 | [#] | [checkmark/x] |
| Pipeline state changes | ≥3 | [#] | [checkmark/x] |
| Partner conversations | 1-2 | [#] | [checkmark/x] |
| Exec update shipped | Yes | Yes | [checkmark] |

**Score:** [X]/5 — [Great week / Acceptable / Red flag]

---

## Wins This Week

1. **[Win 1]:** [One sentence description with specific outcome]
2. **[Win 2]:** [One sentence description with specific outcome]
3. **[Win 3]:** [One sentence description with specific outcome]

---

## Pipeline Snapshot

| State | Count | Change |
|-------|-------|--------|
| New | [#] | [+/- #] |
| Contacted | [#] | [+/- #] |
| Replied | [#] | [+/- #] |
| Meeting | [#] | [+/- #] |
| Passed | [#] | [+/- #] |

**Highlights:**
- [Notable movement or trend]
- [Second notable item]

---

## Key Ecosystem Signals

1. **[Signal 1]:** [What happened + what it means for us]
2. **[Signal 2]:** [What happened + what it means for us]

---

## Next Week

**Thesis:** [Next week's segment/thesis]

**Focus:**
- [Key activity 1]
- [Key activity 2]
- [Key activity 3]

---

## Blockers / Asks

[Any blockers or requests for leadership — or "None this week" if clear]

---

*Sent from the Bitcoin Ecosystem Growth OS. Full test plan and pipeline details in `/weekly-plans/`.*
```

---

## Decision Rules

### Flagging vs. Escalating

**Flag (include in update but don't highlight):**
- Metrics slightly below target (e.g., 9 targets instead of 10)
- Minor pipeline stalls (1 week in same state)
- Signals that are interesting but not actionable

**Escalate (highlight in Blockers section):**
- Metrics significantly below target (e.g., <5 targets, 0 pipeline changes)
- Pipeline stalls >2 weeks
- Signals that require leadership decision
- Resource constraints blocking progress

### What NOT to Include

- Activity without outcome (e.g., "researched 50 companies" — unless it led to targets)
- Signals without strategic implication
- Minor process issues (save for retro)
- Anything requiring >2 sentences to explain (simplify or link to detail)

---

## Example Run

**Date:** Friday, January 31, 2026

---

Subject: Bitcoin Ecosystem Growth — Week of Jan 27, 2026 Update

---

## Weekly Scorecard

| Metric | Target | This Week | Status |
|--------|--------|-----------|--------|
| Test plan shipped | Yes | Yes | ✓ |
| Targets added to pipeline | 10-15 | 12 | ✓ |
| Pipeline state changes | ≥3 | 4 | ✓ |
| Partner conversations | 1-2 | 2 | ✓ |
| Exec update shipped | Yes | Yes | ✓ |

**Score:** 5/5 — Great week

---

## Wins This Week

1. **Meeting booked with PayFlow VP Finance:** Series A recipient from our thesis targeting — first meeting from this week's test plan.
2. **StablePay partnership intro secured:** Mutual contact agreed to intro us to their Head of Partnerships next week.
3. **DataSync Inc replied interested:** Head of People asked for more info on LATAM contractor payments.

---

## Pipeline Snapshot

| State | Count | Change |
|-------|-------|--------|
| New | 12 | +12 |
| Contacted | 8 | +3 |
| Replied | 4 | +2 |
| Meeting | 2 | +1 |
| Passed | 1 | +0 |

**Highlights:**
- PayFlow moved from New → Meeting in 3 days (strong trigger signal worked)
- 3 targets from last week moved from Contacted → Replied (8% reply rate on LATAM fintech thesis)

---

## Key Ecosystem Signals

1. **5 mining operations announced Paraguay expansion:** Suggests growing opportunity for Mining BU cross-border vendor payments. Added to thesis options for next week.
2. **Brazil stablecoin regulation finalized:** Could unlock new Bitwage LATAM opportunities — monitoring for company-level signals.

---

## Next Week

**Thesis:** Bitcoin-native companies at LABITCONF (pre-event targeting)

**Focus:**
- Build target list of LABITCONF speakers/sponsors for TeamPay outreach
- Follow up on 4 replied targets from this week
- First call with StablePay Head of Partnerships (if intro completes)

---

## Blockers / Asks

- **Intro request:** Looking for warm connection to MicroStrategy LATAM team. Does anyone have a contact?
- No other blockers this week.

---

*Sent from the Bitcoin Ecosystem Growth OS. Full test plan and pipeline details in `/weekly-plans/`.*

---

## Quality Checklist

Before shipping exec update:
- [ ] All 5 scorecard metrics are populated
- [ ] Wins are outcome-focused (not activity-focused)
- [ ] Pipeline snapshot includes change vs. last week
- [ ] Key signals have "what it means for us" context
- [ ] Next week thesis is clear
- [ ] Blockers are specific and actionable (or marked "None")
- [ ] Email is under 400 words
- [ ] Format matches template for easy scanning
