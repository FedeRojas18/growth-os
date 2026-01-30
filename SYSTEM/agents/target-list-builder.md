# Agent 3: Target List Builder

> **Run Day:** Monday (start) → Tuesday (finalize)
> **Time Budget:** 1.5 hrs Monday + 1.5 hrs Tuesday
> **What It Automates:** Trigger-based company ID, enrichment, pain mapping, dedup
> **What Stays Human:** Final curation, fit scoring, trigger validation

---

## Purpose

Given a selected thesis, research and produce a trigger-qualified target list of 10-15 companies with enrichment data, pain mapping, and dedup verification. Every target MUST have a valid trigger signal.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Selected thesis | Human selection from Agent 2 output | Yes |
| Trigger Library | Section 6 of `bitcoin-ecosystem-growth-os-v2.1.md` | Yes |
| Signal digest targets | Agent 1 output (Trigger Targets) | Yes |
| Target history (dedup) | `knowledge-base/target-history.md` | Yes |
| Active pipeline | `knowledge-base/target-pipeline.md` | Yes |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| Target List (10-15 companies) | Enriched markdown table | Input to Agent 4 (Messaging Drafter) |
| Dedup additions | New entries | `knowledge-base/target-history.md` |
| Pipeline additions | New entries (state = New) | `knowledge-base/target-pipeline.md` |

---

## Step-by-Step Procedure

### Step 1: Ingest Thesis and Trigger Targets
- Read selected thesis from Agent 2
- Extract the segment, BU fit, best triggers, and buyer persona
- Pull any "Immediate Trigger Targets" from Agent 1's digest that match the thesis

### Step 2: Research Additional Targets
Using the thesis parameters, research to identify companies:

**Research sources:**
- LinkedIn (job postings, company pages)
- Crunchbase (funding, expansion announcements)
- Twitter/X (executive activity, company announcements)
- Industry news (TechCrunch, CoinDesk, local LATAM tech news)
- Event speaker/sponsor lists
- Company blogs and press releases

**For each potential target, capture:**
- Company name
- Website
- HQ location
- Employee count (approximate)
- Relevant trigger signal
- Trigger source (URL or reference)
- Buyer persona identified (name + title if available)
- Pain hypothesis

### Step 3: Apply Trigger Requirement
**HARD RULE:** Every target MUST have ≥1 trigger from the Trigger Library.

For each potential target, verify:
1. What is the specific trigger signal?
2. Which Trigger Library category does it match?
3. How recent is the trigger? (Must be <30 days for most triggers, <60 days for funding)

| Trigger Category | Max Age | Source Requirement |
|------------------|---------|-------------------|
| Hiring | 30 days | LinkedIn job posting URL |
| Expansion | 30 days | News article or press release |
| Stablecoin adoption | 30 days | Announcement or integration news |
| Crypto/BTC treasury | 60 days | Filing, press release, or credible report |
| Event presence | Until event date | Speaker list or sponsor list |
| Funding round | 60 days | Crunchbase, press release |
| Pain signal | 30 days | Interview, social post, or article quote |
| Partnership signal | 30 days | Press release or announcement |
| Regulatory trigger | 60 days | Regulatory announcement |
| Community activity | 30 days | Social media or forum activity |

**If no valid trigger → SKIP the company.**

### Step 4: Check Skip Rules
Before including a company, verify ALL of the following:

- [ ] Company has ≥1 valid trigger signal (mandatory)
- [ ] Trigger is within allowed age window
- [ ] Company has identifiable buyer (name + job title)
- [ ] Company has clear BU fit (Bitwage / TeamPay / Mining)
- [ ] Company is NOT in target-history.md (dedup check)
- [ ] Company is NOT already in target-pipeline.md in an active state

**Hard skips:**
- No trigger signal → SKIP
- No identifiable buyer → SKIP
- No clear BU fit → SKIP
- Already contacted in past 90 days → SKIP

**Soft skips (deprioritize but may include if list is short):**
- Trigger is 25-30 days old → deprioritize
- Buyer identified but no name (only title) → deprioritize
- Company <10 employees → deprioritize (unless Bitcoin-native)

### Step 5: Enrich Target Data
For each qualified target, gather:

| Field | Description | Priority |
|-------|-------------|----------|
| Company | Name | Required |
| Website | URL | Required |
| HQ | Location | Required |
| Size | Employee count | Required |
| Trigger | Specific signal | Required |
| Trigger Source | URL or reference | Required |
| Trigger Date | When signal occurred | Required |
| BU Fit | Bitwage / TeamPay / Mining | Required |
| Buyer Name | Full name | High |
| Buyer Title | Job title | Required |
| Buyer LinkedIn | Profile URL | High |
| Buyer Email | If available | Optional |
| Pain Hypothesis | Why they need us | Required |
| Notes | Additional context | Optional |

### Step 6: Limit to 10-15 Targets
If research produces >15 targets:
1. Rank by trigger strength (more recent + clearer = higher)
2. Rank by buyer accessibility (name + email > name only > title only)
3. Rank by BU priority alignment
4. Remove lowest-ranked targets until 10-15 remain

If research produces <10 targets:
1. Document the shortfall
2. Consider expanding trigger age window slightly (30 → 45 days)
3. Consider adjacent segments within scope
4. Note in output that list is below target

### Step 7: Produce Target List
Format output as:

```markdown
## Target List — Week of [DATE]

### Thesis
[Selected thesis statement from Agent 2]

### Summary
- Targets identified: [X]
- Targets qualified: [Y]
- Targets skipped: [Z]
- Primary BU: [Bitwage / TeamPay / Mining]

---

### Target Table

| # | Company | Website | HQ | Size | Trigger | Trigger Date | BU Fit | Buyer | Title | LinkedIn | Pain Hypothesis |
|---|---------|---------|-----|------|---------|--------------|--------|-------|-------|----------|-----------------|
| 1 | [name] | [url] | [loc] | [#] | [signal] | [date] | [BU] | [name] | [title] | [url] | [pain] |
| 2 | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

### Skipped Companies (Transparency Log)

| Company | Reason Skipped |
|---------|----------------|
| [name] | No valid trigger |
| [name] | Already in pipeline |
| [name] | No identifiable buyer |

---

### Research Notes
- [Any context about the research process, sources used, or challenges encountered]
- [Suggestions for improving trigger detection in this segment]

---

### Handoff to Messaging Drafter
- Total targets for messaging: [X]
- Buyer personas: [list unique titles]
- Pain themes: [list common pain hypotheses]
```

### Step 8: Update Dedup and Pipeline Files
After human approval:
1. Add all targets to `knowledge-base/target-history.md`
2. Add all targets to `knowledge-base/target-pipeline.md` with state = "New"

---

## Decision Rules

### Hard Skips (Never Include)
- No trigger signal → SKIP (non-negotiable)
- Trigger older than allowed window → SKIP
- No identifiable buyer (not even job title) → SKIP
- No clear BU fit → SKIP
- Already contacted in past 90 days → SKIP
- Company in "Closed-Lost" within past 6 months → SKIP

### Deprioritize (Include Only If List is Short)
- Trigger is 25-30 days old → rank lower
- Only job title, no buyer name → rank lower
- Company <10 employees (unless Bitcoin-native) → rank lower
- Buyer is junior title (Analyst, Associate) → rank lower

### Escalate to Human
- Trigger is ambiguous (could be valid or not) → flag for review
- Company was contacted >90 days ago with no response → ask if retry
- Target is a known competitor or partner → flag before including

---

## Example Run

**Date:** Tuesday, January 28, 2026

### Thesis
LATAM Fintech Series A Recipients — Target LATAM-focused fintechs that raised Series A in the past 60 days, as they're scaling teams and likely adding cross-border contractor payments.

### Summary
- Targets identified: 18
- Targets qualified: 12
- Targets skipped: 6
- Primary BU: Bitwage

---

### Target Table

| # | Company | Website | HQ | Size | Trigger | Trigger Date | BU Fit | Buyer | Title | LinkedIn | Pain Hypothesis |
|---|---------|---------|-----|------|---------|--------------|--------|-------|-------|----------|-----------------|
| 1 | PayFlow | payflow.io | Mexico City | 85 | Series A ($12M) for LATAM expansion | Jan 15, 2026 | Bitwage | Maria Santos | VP Finance | linkedin.com/in/msantos | Scaling LATAM team, likely adding contractors |
| 2 | DataSync Inc | datasync.com | Austin, TX | 120 | Hiring 15 contractors in MX/CO | Jan 22, 2026 | Bitwage | John Chen | Head of People | linkedin.com/in/jchen | Active FX friction with contractor payments |
| 3 | RemoteTech | remotetech.co | São Paulo | 65 | CFO posted about cross-border payment friction | Jan 20, 2026 | Bitwage | Carlos Silva | CFO | linkedin.com/in/csilva | Explicitly stated pain point |
| 4 | FinanceraLATAM | financera.lat | Bogotá | 45 | Series A ($8M), hiring in 4 LATAM countries | Jan 10, 2026 | Bitwage | Ana Gomez | VP People | linkedin.com/in/agomez | Multi-country payroll complexity |
| 5 | ContractorHub | contractorhub.mx | Monterrey | 30 | Hiring 8 remote roles across LATAM | Jan 18, 2026 | Bitwage | Roberto Diaz | Finance Director | linkedin.com/in/rdiaz | Managing contractor payments manually |
| 6 | PayLatam | paylatam.com | Buenos Aires | 55 | Announced stablecoin integration | Jan 12, 2026 | Bitwage | Laura Martinez | Head of Ops | linkedin.com/in/lmartinez | Building cross-border rails, potential partner |
| 7 | TechBridgeMX | techbridge.mx | Guadalajara | 40 | Seed+ round, expanding to Colombia | Jan 8, 2026 | Bitwage | Miguel Torres | CFO | linkedin.com/in/mtorres | Cross-border expansion friction |
| 8 | RemoteFirst | remotefirst.io | Remote (US-based) | 95 | Hiring 20 LATAM contractors (LinkedIn) | Jan 24, 2026 | Bitwage | Sarah Johnson | VP Finance | linkedin.com/in/sjohnson | Scaling LATAM contractor base rapidly |
| 9 | FintechBR | fintechbr.com | São Paulo | 70 | Announced MX office opening | Jan 16, 2026 | Bitwage | Pedro Almeida | COO | linkedin.com/in/palmeida | Multi-country ops starting |
| 10 | CloudPayroll | cloudpayroll.co | Medellín | 35 | Raised $5M, adding LATAM markets | Jan 5, 2026 | Bitwage | Diana Reyes | Head of Finance | linkedin.com/in/dreyes | Scaling payroll infrastructure |
| 11 | DigitalNomadHQ | digitalnomad.io | Miami | 25 | Actively tweeting about contractor payment friction | Jan 21, 2026 | Bitwage | Alex Rivera | Founder/CEO | linkedin.com/in/arivera | Vocal about pain point |
| 12 | ScaleLATAM | scalelatam.vc | Santiago | 50 | Portfolio company support, hiring ops in LATAM | Jan 19, 2026 | Bitwage | Valentina Rojas | Head of Platform | linkedin.com/in/vrojas | Supporting portfolio with contractor payments |

---

### Skipped Companies (Transparency Log)

| Company | Reason Skipped |
|---------|----------------|
| OldTechCo | Funding was 90 days ago (outside window) |
| CryptoStartup | No identifiable buyer (company too small, no LinkedIn presence) |
| BigCorpLATAM | Already in pipeline (Contacted state) |
| TinyShop | <10 employees, not Bitcoin-native |
| MysteryFintech | No trigger signal found |
| PartnerCompany | Known Bitwage partner (flagged, excluded) |

---

### Research Notes
- LinkedIn was most productive source for hiring triggers
- Crunchbase caught 4 of the 6 funding triggers
- Several companies had multiple triggers (funding + hiring) — used strongest
- Suggest adding "Remote job boards" to sources.md for future scans

---

### Handoff to Messaging Drafter
- Total targets for messaging: 12
- Buyer personas: VP Finance (3), CFO (3), Head of People/Ops (4), Founder (1), COO (1)
- Pain themes: LATAM contractor scaling, Cross-border FX friction, Multi-country payroll complexity

---

## Quality Checklist

Before handing off target list:
- [ ] All targets have valid, recent trigger signals
- [ ] All triggers match Trigger Library categories
- [ ] All targets have identifiable buyer (at minimum: job title)
- [ ] All targets have clear BU fit
- [ ] Dedup check completed against target-history.md
- [ ] Pipeline check completed against target-pipeline.md
- [ ] List is 10-15 targets (or shortfall documented)
- [ ] Skipped companies documented with reasons
- [ ] Pain hypotheses are specific, not generic
