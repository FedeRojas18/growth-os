# Agent 5: Partner One-Pager

> **Run Day:** Wednesday
> **Time Budget:** 1-1.5 hrs per partner
> **What It Automates:** Partner research, fit assessment, mutual value framing
> **What Stays Human:** Relationship building, negotiation, communication

---

## Purpose

Research a potential channel partner and produce a one-pager that articulates mutual value, BU fit, and a clear intro script. Partners are organizations that can refer leads, co-market, or provide ecosystem credibility — not direct customers.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Partner prospect | From Agent 1 "Partner Leads" or operator input | Yes |
| BU context | `ecosystem_context.md` | Yes |
| Existing partnerships | `knowledge-base/partnership-pipeline.md` | Optional |
| Partnership signal (if applicable) | Agent 1 digest | Optional |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| Partner One-Pager | Structured markdown document | Saved to weekly-plans/ or shared with team |
| Next step recommendation | Clear action item | Included in one-pager |

---

## Step-by-Step Procedure

### Step 1: Initial Partner Research
Gather basic information:
- Company name, website, HQ
- What they do (1-2 sentences)
- Company size and stage
- Key leadership (names, titles, LinkedIn)
- Recent news or announcements
- Existing partnerships they've announced

### Step 2: Assess Strategic Fit
Answer these questions:

**Audience Overlap:**
- Who is their customer?
- Does this overlap with Bitwage/TeamPay/Mining customers?
- What % of their customers could use our products?

**Value Exchange:**
- What do they get from partnering with us?
- What do we get from partnering with them?
- Is this a referral partnership, co-marketing, integration, or other?

**BU Fit:**
- Which BU benefits most? (Bitwage / TeamPay / Mining / Foundation)
- Is there secondary BU value?

**Competitive Landscape:**
- Do they already partner with competitors?
- Are they a potential competitor themselves?

### Step 3: Apply Skip Rules
Check for hard skips before proceeding:

**Hard Skips:**
- [ ] No identifiable mutual value exchange → SKIP
- [ ] Partner is a direct competitor → SKIP
- [ ] Partner already has exclusive deal with competitor → SKIP
- [ ] No clear path to intro (no warm connection, no shared context) → SKIP

**Deprioritize (park for later):**
- Partner requires >3 touchpoints before any referral path → deprioritize behind warmer leads
- Partner audience overlap is <10% → deprioritize
- Partner is very early stage (<10 employees) with no established customer base → deprioritize

If any hard skip applies, document reason and do not proceed with one-pager.

### Step 4: Define Mutual Value Proposition
Be specific about what each party gains:

**For Them:**
- What problem do we solve for their customers?
- How does referring to us make them look good?
- What's the commercial arrangement (referral fee, co-marketing, etc.)?
- Does this strengthen their market position?

**For Us:**
- What lead volume/quality can they deliver?
- What credibility/logos do they bring?
- What market access do they provide?
- What's the effort-to-return ratio?

### Step 5: Craft Intro Script
Write a 3-4 sentence intro script for initial outreach:
- Sentence 1: Who we are and why reaching out
- Sentence 2: Why we think there's a fit (specific to them)
- Sentence 3: Mutual value proposition
- Sentence 4: Simple CTA

### Step 6: Produce One-Pager
Format output as:

```markdown
# Partner One-Pager: [Partner Name]

**Date:** [Date]
**Status:** [New / Researching / Outreach / Conversation / Active / Deprioritized]
**Primary BU:** [Bitwage / TeamPay / Mining / Foundation]
**Priority:** [High / Medium / Low]

---

## Company Overview

**Company:** [Name]
**Website:** [URL]
**HQ:** [Location]
**Size:** [Employees]
**Stage:** [Seed / Series A / Growth / etc.]
**What They Do:** [1-2 sentence description]

---

## Key Contacts

| Name | Title | LinkedIn | Notes |
|------|-------|----------|-------|
| [Name] | [Title] | [URL] | [Context: decision-maker, intro path, etc.] |

---

## Strategic Fit Assessment

### Audience Overlap
[Who are their customers? How do they overlap with ours?]

### Why They Would Partner
[What do they gain from this partnership?]

### Why We Would Partner
[What do we gain from this partnership?]

### Partnership Type
[Referral / Co-marketing / Integration / Strategic / Other]

### Competitive Considerations
[Do they partner with competitors? Any conflicts?]

---

## Mutual Value Proposition

### For [Partner Name]
- [Specific benefit 1]
- [Specific benefit 2]
- [Specific benefit 3]

### For Bitwage/TeamPay/Mining
- [Specific benefit 1]
- [Specific benefit 2]
- [Specific benefit 3]

---

## Intro Script

> [3-4 sentence intro script ready to use for first outreach]

---

## Path to Intro

**Warm Connection:** [Do we have any shared contacts, events, or context?]

**Best Channel:** [Email / LinkedIn / Event / Mutual contact intro]

**Timing Consideration:** [Is there a specific trigger or timing factor?]

---

## Next Step

**Action:** [Specific next action to take]
**Owner:** [Who is responsible]
**By When:** [Date]

---

## Risk / Considerations

- [Any risks or concerns about this partnership]
- [Dependencies or blockers]

---

## Notes

- [Additional context, research notes, or background]
```

### Step 7: Update Partnership Pipeline
After producing one-pager:
1. Add partner to `knowledge-base/partnership-pipeline.md` if not already there
2. Update status if partner already exists

---

## Decision Rules

### Hard Skips (Never Produce One-Pager)
- No identifiable mutual value → SKIP
- Direct competitor → SKIP
- Exclusive competitor partnership → SKIP
- No path to intro → SKIP

### Deprioritize
- Requires >3 touchpoints before any referral path
- Audience overlap <10%
- Very early stage with no customer base
- Weak signal (interesting but no immediate opportunity)

### Escalate to Human
- Partner is a current customer or prospect → flag conflict
- Partner involves complex commercial terms → flag for leadership
- High-profile partner that requires executive involvement → escalate

---

## Example Run

**Date:** Wednesday, January 29, 2026

# Partner One-Pager: StablePay

**Date:** January 29, 2026
**Status:** New
**Primary BU:** Bitwage
**Priority:** High

---

## Company Overview

**Company:** StablePay
**Website:** stablepay.io
**HQ:** Miami, FL (LATAM-focused)
**Size:** 45 employees
**Stage:** Series A
**What They Do:** Stablecoin payment infrastructure for cross-border B2B payments in LATAM.

---

## Key Contacts

| Name | Title | LinkedIn | Notes |
|------|-------|----------|-------|
| Carlos Mendez | CEO | linkedin.com/in/cmendez | Founder, former Stripe LATAM |
| Ana Torres | Head of Partnerships | linkedin.com/in/atorres | Decision-maker for partnerships |
| Diego Vargas | VP Product | linkedin.com/in/dvargas | Could be relevant for integrations |

---

## Strategic Fit Assessment

### Audience Overlap
StablePay serves SMBs and mid-market companies making cross-border B2B payments in LATAM. Strong overlap with Bitwage's target customer base — companies with LATAM operations that need efficient cross-border payment rails.

### Why They Would Partner
- Bitwage adds contractor/payroll capabilities to their B2B payment offering
- Referral fees for sending payroll-focused customers
- Strengthens their "complete LATAM payment solution" positioning

### Why We Would Partner
- Access to their customer base (500+ companies with LATAM cross-border needs)
- Credibility association with well-funded stablecoin infrastructure player
- Warm intro path to companies already using crypto rails for B2B

### Partnership Type
Referral + potential technical integration (Bitwage as payroll layer on their rails)

### Competitive Considerations
- No known competitor partnerships
- Not competitive — complementary (B2B payments vs. payroll/contractors)

---

## Mutual Value Proposition

### For StablePay
- Add payroll/contractor capability to their product offering without building it
- Earn referral fees on customers who need contractor payments
- Differentiate from pure B2B payment competitors

### For Bitwage
- Access to 500+ companies with proven cross-border LATAM needs
- Warm leads (already using stablecoin rails)
- Potential integration for seamless customer experience

---

## Intro Script

> Hi Ana, I lead partnerships at Bitwage — we're the leading platform for paying contractors in LATAM using stablecoin rails. I noticed StablePay's recent partnership announcement and thought there might be a fit: many of your B2B payment customers likely also have contractor payment needs that we could help with. Would you be open to a quick call to explore whether a referral or integration partnership makes sense?

---

## Path to Intro

**Warm Connection:** We share a mutual connection (David Kim, fintech investor) who could intro.

**Best Channel:** Email via mutual contact intro, backup: LinkedIn DM to Ana.

**Timing Consideration:** They just announced a major partnership (see Agent 1 signal), so they're clearly in partnership-building mode.

---

## Next Step

**Action:** Request warm intro from David Kim to Ana Torres
**Owner:** Fede (JGA)
**By When:** January 31, 2026

---

## Risk / Considerations

- They may already be talking to competitor (Deel, Remote) for payroll partnerships
- Integration partnership would require engineering resources on both sides
- Referral-only partnership may have limited volume initially

---

## Notes

- CEO Carlos Mendez spoke at Bitcoin Miami 2025 — could be a connection point
- They raised Series A in October 2025 ($15M) — actively building out partnerships
- Their blog mentions "expanding payroll capabilities" as a 2026 priority — strong timing signal

---

## Quality Checklist

Before finalizing partner one-pager:
- [ ] Mutual value is specific and clearly articulated (not generic)
- [ ] BU fit is clear
- [ ] Key contacts are identified with decision-maker flagged
- [ ] Path to intro is realistic (not cold outreach to CEO)
- [ ] Intro script is ready to use
- [ ] Next step is specific with owner and date
- [ ] Risks/considerations are documented
- [ ] Partnership pipeline updated
