# Agent 2: Segment Thesis Selector

> **Run Day:** Monday
> **Time Budget:** 30 min agent run + 30 min human selection
> **What It Automates:** Proposes 3 ranked theses from segment menu + signals
> **What Stays Human:** Final thesis selection (human picks)

---

## Purpose

Ingest the Monday signal digest, cross-reference with the Segment Menu and Trigger Library, and propose 3 ranked thesis options for the week. Human operator makes final selection.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Monday Signal Digest | Output from Agent 1 (Ecosystem Intelligence Monitor) | Yes |
| Segment Menu | Section 7 of `bitcoin-ecosystem-growth-os-v2.1.md` | Yes |
| Trigger Library | Section 6 of `bitcoin-ecosystem-growth-os-v2.1.md` | Yes |
| Previous week's results | `knowledge-base/target-pipeline.md` | Optional |
| Ecosystem context | `ecosystem_context.md` | Optional |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| 3 Ranked Thesis Options | Structured comparison table | Presented to operator for selection |
| Recommended thesis | Top-ranked option with rationale | Highlighted in output |

---

## Step-by-Step Procedure

### Step 1: Ingest Signal Digest
- Read the Monday Signal Digest from Agent 1
- Extract:
  - Thesis Candidates (new segment ideas from signals)
  - Trigger Target count by segment
  - BU distribution of signals

### Step 2: Cross-Reference Segment Menu
For each segment in the menu, calculate:
- **Signal density:** How many of this week's signals map to this segment?
- **Trigger availability:** What triggers from the Trigger Library apply?
- **Recent performance:** How did this segment perform in past weeks? (from `target-pipeline.md`)

### Step 3: Apply Scope Guardrails
For each candidate thesis, verify:
1. **Signal density:** Are there ≥3 identifiable companies with active triggers?
2. **Buyer clarity:** Can we name the job title of the person who would buy/partner?
3. **Path to pipeline:** Does this produce a target list, partner intro, or event lead within 2 weeks?

If a segment fails ANY gate → exclude from thesis options (log in `ecosystem-guide.md` as "watch" item).

### Step 4: Rank Thesis Options
Score each passing thesis on:

| Factor | Weight | Scoring |
|--------|--------|---------|
| Signal density (# of companies with triggers) | 30% | 3+ = High, 2 = Med, 1 = Low |
| Trigger strength (how clear is the "why now") | 25% | Clear = High, Inferred = Med, Weak = Low |
| BU priority alignment | 20% | Primary BU focus = High, Secondary = Med |
| Conversion history (if segment tested before) | 15% | >10% reply = High, 5-10% = Med, <5% = Low |
| Effort to research | 10% | Easy = High, Moderate = Med, Hard = Low |

### Step 5: Check Skip Rules
Before including a thesis option:
- [ ] Segment has ≥3 trigger-qualified companies
- [ ] Buyer persona is clear (job title identifiable)
- [ ] Path to pipeline exists (not just "interesting")
- [ ] Not the same segment as last 2 weeks (rotation unless high-performing)

### Step 6: Produce Thesis Options
Format output as:

```markdown
## Thesis Options — Week of [DATE]

### Signal Summary
- Total actionable signals this week: [X]
- Signals by BU: Bitwage [N], TeamPay [M], Mining [P], Foundation [Q]
- New thesis candidates from signals: [list]

---

### Option 1: [THESIS NAME] ⭐ Recommended

**Thesis Statement:** [One sentence describing the segment + trigger + expected outcome]

**Why Now:** [What signals or triggers make this timely]

**Segment:** [From Segment Menu]

**Primary BU:** [Bitwage / TeamPay / Mining]

**Expected Targets:** [Estimated # of companies we can identify]

**Best Triggers:** [Which triggers from Trigger Library apply]

**Buyer Persona:** [Job title(s) we'll target]

**Expected ROI:** [What outcome we expect: replies, meetings, intros]

**Risk/Consideration:** [Any concerns or dependencies]

**Score Breakdown:**
- Signal density: [High/Med/Low]
- Trigger strength: [High/Med/Low]
- BU priority: [High/Med/Low]
- Conversion history: [High/Med/Low or N/A if new]
- Research effort: [High/Med/Low]

---

### Option 2: [THESIS NAME]

[Same format as Option 1]

---

### Option 3: [THESIS NAME]

[Same format as Option 1]

---

### Segments Excluded (Failed Guardrails)

| Segment | Reason Excluded |
|---------|-----------------|
| [Segment name] | [Which guardrail failed: signal density, buyer clarity, or path to pipeline] |

---

### Recommendation

**Select Option [1/2/3] because:** [Brief rationale]

**If operator disagrees:** [Alternative suggestion or request for input]
```

### Step 7: Human Selection Handoff
Present options to operator with:
- Clear recommendation and rationale
- Trade-offs between options
- Request for final decision

---

## Decision Rules

### Hard Skips (Never Propose)
- Segment has <3 trigger-qualified companies → exclude
- No identifiable buyer persona → exclude
- No path to pipeline within 2 weeks → exclude
- Same segment used 2+ weeks in a row (unless reply rate >15%) → exclude

### Deprioritize
- Segment has only 3-4 targets → note as "shallow bench" risk
- Segment requires extensive research → note effort level

### Escalate to Human
- Two options score equally → ask for preference
- Signal suggests new segment not in menu → propose adding to menu
- Conflict between BU priorities → request guidance

---

## Example Run

**Date:** Monday, January 27, 2026

### Signal Summary
- Total actionable signals this week: 8
- Signals by BU: Bitwage 5, TeamPay 2, Mining 1
- New thesis candidates: Paraguay mining expansion, LATAM stablecoin rails

---

### Option 1: LATAM Fintech Series A Recipients ⭐ Recommended

**Thesis Statement:** Target LATAM-focused fintechs that raised Series A in the past 60 days, as they're scaling teams and likely adding cross-border contractor payments.

**Why Now:** PayFlow raised Series A for LATAM expansion; 3 other signals indicate funding activity in the space.

**Segment:** LATAM-expanding fintechs with cross-border payroll needs

**Primary BU:** Bitwage

**Expected Targets:** 8-12 companies

**Best Triggers:** Funding round, Hiring, Expansion

**Buyer Persona:** CFO, VP Finance, Head of People

**Expected ROI:** 2-3 replies, 1 meeting

**Risk/Consideration:** Fintechs may have in-house solutions; need to validate pain point.

**Score Breakdown:**
- Signal density: High (4+ signals)
- Trigger strength: High (funding = clear "why now")
- BU priority: High (Bitwage core)
- Conversion history: Med (tested 3 weeks ago, 8% reply rate)
- Research effort: High (public data available)

---

### Option 2: Bitcoin-Native Companies at LABITCONF

**Thesis Statement:** Target Bitcoin-native companies whose executives are speaking or attending LABITCONF, offering TeamPay BTC card as a wedge.

**Why Now:** LABITCONF is 3 weeks away; MicroStrategy LATAM CEO and 2 others confirmed speaking.

**Segment:** Bitcoin-native companies needing corporate finance tools

**Primary BU:** TeamPay

**Expected Targets:** 6-8 companies

**Best Triggers:** Event presence, Community activity

**Buyer Persona:** CFO, Founder

**Expected ROI:** 2 warm intros, 1 event meeting

**Risk/Consideration:** Smaller pool; dependent on event timing.

**Score Breakdown:**
- Signal density: Med (3 signals)
- Trigger strength: High (event = forcing function)
- BU priority: High (TeamPay ecosystem wedge)
- Conversion history: N/A (new thesis)
- Research effort: High (speaker lists public)

---

### Option 3: Paraguay Mining Expansion

**Thesis Statement:** Target mining operations expanding to Paraguay with multi-country vendor payment needs.

**Why Now:** 5 mining ops announced Paraguay expansion this week.

**Segment:** Mining operations with multi-country vendor payments

**Primary BU:** Mining

**Expected Targets:** 5-6 companies

**Best Triggers:** Expansion, Partnership signal

**Buyer Persona:** CFO, Ops Director

**Expected ROI:** 1-2 introductions, relationship building

**Risk/Consideration:** Longer sales cycle; smaller immediate pipeline impact.

**Score Breakdown:**
- Signal density: Med (5 companies but tight cluster)
- Trigger strength: Med (expansion announced but timing unclear)
- BU priority: Med (Mining BU secondary)
- Conversion history: N/A (new thesis)
- Research effort: Med (some companies private)

---

### Segments Excluded (Failed Guardrails)

| Segment | Reason Excluded |
|---------|-----------------|
| NGOs using Bitcoin in LATAM | Signal density: Only 1 signal this week |
| Stablecoin payment providers | Buyer clarity: Unclear who the decision-maker is |

---

### Recommendation

**Select Option 1 because:** Highest signal density, proven segment with previous 8% reply rate, clear trigger (funding), and direct Bitwage fit. Option 2 is strong but time-dependent on LABITCONF proximity.

**If operator disagrees:** Consider Option 2 if TeamPay logos are a higher priority this week, or blend by adding LABITCONF targets to the Bitwage list.

---

## Quality Checklist

Before presenting thesis options:
- [ ] All 3 options pass scope guardrails
- [ ] Each option has clear "why now" rationale
- [ ] Expected ROI is realistic and measurable
- [ ] Buyer personas are specific (job titles)
- [ ] Best triggers are from the Trigger Library
- [ ] Excluded segments are documented with reasons
- [ ] Recommendation is clear with rationale
