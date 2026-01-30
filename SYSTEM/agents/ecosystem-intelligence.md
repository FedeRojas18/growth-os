# Agent 1: Ecosystem Intelligence Monitor

> **Run Day:** Monday
> **Time Budget:** 30 min agent run + 30 min human review
> **What It Automates:** Source scanning, signal filtering, action mapping, digest production
> **What Stays Human:** Interpreting strategic implications, escalation decisions

---

## Purpose

Scan all sources in `knowledge-base/sources.md`, filter for actionable signals, and produce a Monday digest with explicit action mapping. Every kept signal must map to exactly one action type.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Source list with URLs and scan instructions | `knowledge-base/sources.md` | Yes |
| Current thesis/segment context | Previous week's test plan or operator input | Yes |
| Existing ecosystem knowledge | `knowledge-base/ecosystem-guide.md` | Optional |
| Active pipeline | `knowledge-base/target-pipeline.md` | Optional |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| Monday Signal Digest | Markdown table with action mapping | Presented to operator for review |
| Action Mapping Table | Each signal tagged with action type | Embedded in digest |

---

## Step-by-Step Procedure

### Step 1: Load Sources
- Read `knowledge-base/sources.md`
- For each source, note the URL, category, and scan priority

### Step 2: Scan Each Source
- Visit each source URL (or use cached/API data where applicable)
- Extract signals relevant to the targeting scope:
  - Cross-border payroll + contractor payments
  - Stablecoin adoption in LATAM
  - Bitcoin-native companies + fintech operators
  - Mining + infrastructure ecosystem
  - NGOs / circular economy partners

### Step 3: Apply Signal Filter
For each potential signal, ask:
1. Is this signal less than 7 days old? (If no → discard)
2. Does it relate to a company/person, not just general news? (If no → discard)
3. Can I identify a specific trigger from the Trigger Library? (If no → flag for review)

### Step 4: Apply "No Signal Without Action" Gate
For each kept signal, assign exactly ONE action type:

| Action Type | Definition | Example |
|-------------|------------|---------|
| **Thesis Candidate** | Signal suggests a new segment/thesis to test | "3 mining companies announced LATAM expansion this week" |
| **Trigger Target** | Signal qualifies a specific company for this week's target list | "Company X hiring LATAM contractors" |
| **Partner Lead** | Signal suggests a partnership opportunity | "Platform Y announced integration with Bitwage competitor" |

**HARD RULE:** If a signal cannot be mapped to one of these three action types → DROP IT from the digest.

### Step 5: Check Skip Rules
Before including any signal, verify:
- [ ] Signal has action mapping (thesis/trigger/partner)
- [ ] Signal relates to targeting scope (not tangential)
- [ ] Signal has identifiable company/person (not just trend)

If any check fails → exclude from digest.

### Step 6: Produce Digest
Format output as:

```markdown
## Monday Signal Digest — [DATE]

### Summary
- Total signals scanned: [X]
- Signals kept: [Y]
- Action breakdown: [N] thesis candidates, [M] trigger targets, [P] partner leads

### Action Mapping Table

| # | Signal | Source | Company/Person | Trigger Type | Action Type | BU Fit | Priority |
|---|--------|--------|----------------|--------------|-------------|--------|----------|
| 1 | [description] | [source] | [name] | [from trigger library] | Thesis/Trigger/Partner | Bitwage/TeamPay/Mining | High/Med/Low |

### Thesis Candidates (for Segment Thesis Selector)
- [List signals tagged as Thesis Candidate with brief context]

### Immediate Trigger Targets (for Target List Builder)
- [List signals tagged as Trigger Target — these go directly into this week's research]

### Partner Leads (for Partner One-Pager)
- [List signals tagged as Partner Lead — queue for Wednesday]

### Dropped Signals (for transparency)
- [List 3-5 signals that were dropped and why]
```

### Step 7: Human Review Handoff
Present digest to operator with:
- Recommended thesis candidates highlighted
- Any signals that were borderline (flagged but kept)
- Questions about strategic implications

---

## Decision Rules

### Hard Skips (Never Include)
- Signal has no action mapping → DROP
- Signal is >7 days old → DROP
- Signal is general news with no company/person → DROP
- Signal relates to geography/vertical outside scope → DROP

### Deprioritize (Flag but Don't Action)
- Signal is interesting but no immediate conversion path → Log in `ecosystem-guide.md`
- Signal relates to a segment with <3 companies → Flag for Thursday research

### Escalate to Human
- Signal suggests major strategic shift (new competitor, regulation change)
- Signal involves existing relationship (partner or customer)
- Signal is ambiguous between action types

---

## Example Run

**Date:** Monday, January 27, 2026

**Sources Scanned:** 12
**Signals Found:** 47
**Signals Kept:** 8

### Action Mapping Table

| # | Signal | Source | Company/Person | Trigger Type | Action Type | BU Fit | Priority |
|---|--------|--------|----------------|--------------|-------------|--------|----------|
| 1 | Announced Series A for LATAM payroll expansion | TechCrunch | PayFlow (fintech) | Funding round | Trigger Target | Bitwage | High |
| 2 | Hiring 15 contractors in Mexico and Colombia | LinkedIn | DataSync Inc | Hiring | Trigger Target | Bitwage | High |
| 3 | CEO speaking at LABITCONF on BTC treasury | Twitter | MicroStrategy LATAM | Event presence | Trigger Target | TeamPay | High |
| 4 | 5 mining ops announced Paraguay expansion | CoinDesk | Multiple | Expansion | Thesis Candidate | Mining | Med |
| 5 | Stablecoin payment rail partnership announced | Press Release | StablePay | Partnership signal | Partner Lead | Bitwage | Med |
| 6 | Posted about cross-border payment friction | LinkedIn | CFO @ RemoteTech | Pain signal | Trigger Target | Bitwage | Med |
| 7 | Launched USDC integration for LATAM | Company Blog | TransferFlow | Stablecoin adoption | Thesis Candidate | Bitwage | Med |
| 8 | Attending Bitcoin Mining Summit next month | Twitter | GridPower Mining | Event presence | Trigger Target | Mining | Low |

### Thesis Candidates
1. **Paraguay Mining Expansion** — 5 mining operations announced expansion. Could be a thesis: "Mining ops expanding to Paraguay with multi-country vendor payment needs."
2. **LATAM Stablecoin Rails** — TransferFlow launch suggests growing segment of stablecoin payment providers.

### Immediate Trigger Targets
- PayFlow, DataSync Inc, MicroStrategy LATAM, RemoteTech CFO, GridPower Mining

### Partner Leads
- StablePay — potential partnership for Bitwage LATAM rails

### Dropped Signals
- "Bitcoin price reaches new high" — no company/person, general news
- "Crypto regulation discussed in EU" — outside LATAM scope
- "Interesting thread on contractor payments" — no specific company

---

## Quality Checklist

Before handing off digest:
- [ ] Every kept signal has exactly one action type
- [ ] No signals older than 7 days
- [ ] All signals have identifiable company/person
- [ ] Trigger types match Trigger Library categories
- [ ] BU fit is clear for each signal
- [ ] Dropped signals are documented for transparency
