# Agent 4: Messaging Drafter

> **Run Day:** Tuesday
> **Time Budget:** 1.5 hrs agent run + human review
> **What It Automates:** Outreach variants, pain-to-product mapping, formatting
> **What Stays Human:** Tone calibration, strategic framing, approval

---

## Purpose

Given a target list with pain hypotheses, produce 2-3 messaging variants per channel (email, LinkedIn) that connect the target's specific pain to Bitwage/TeamPay/Mining value propositions. Messages should be ready for a TeamPay team member to send.

---

## Inputs

| Input | Location | Required |
|-------|----------|----------|
| Target List | Output from Agent 3 (Target List Builder) | Yes |
| Pain hypotheses | Embedded in target list | Yes |
| BU positioning | `ecosystem_context.md` | Yes |
| Trigger signals | Embedded in target list | Yes |
| Buyer personas | Embedded in target list | Yes |

---

## Outputs

| Output | Format | Destination |
|--------|--------|-------------|
| Messaging variants (2-3 per target) | Email + LinkedIn formats | Included in weekly test plan |
| Pain-to-product mapping | Reference table | Included in weekly test plan |

---

## Step-by-Step Procedure

### Step 1: Ingest Target List and Thesis
- Read target list from Agent 3
- Extract:
  - Each target's trigger signal
  - Each target's pain hypothesis
  - Buyer persona (name + title)
  - BU fit

### Step 2: Build Pain-to-Product Map
For the thesis/segment, create a reference table with **varied proof points** (don't reuse the same proof in every message):

| Pain Point | Product Feature | Value Prop | Proof Point Options (rotate these) |
|------------|-----------------|------------|-----------------------------------|
| Cross-border contractor payments are slow and expensive | Bitwage instant stablecoin rails | Pay contractors in LATAM in minutes, not days | "One CFO told me their bank's FX spread was embarrassing" / "A Series B fintech cut wire costs by $40K/year" / "Your contractors get paid before you finish your coffee" |
| Managing multi-country payroll is complex | Bitwage unified contractor platform | One dashboard for AR, BR, MX — no more juggling three banks | "We handle payroll for 3 of the top 10 LATAM neobanks" / "A 200-person fintech went from 5 vendor relationships to 1" |
| BTC treasury companies lack corporate finance tools | TeamPay BTC card | Spend BTC directly for business expenses | "First corporate card that thinks in sats, not dollars" / "Treasury teams stop converting to fiat for every expense" |
| Mining ops have multi-country vendor payment friction | Bitwage cross-border rails | Pay vendors across LATAM from single account | "Mining ops in Paraguay/Chile use us for vendor payments" / "One client cut their vendor payment cycle from 5 days to same-day" |

### Step 3: Draft Messaging Variants
For EACH target, draft 2-3 variants:

**Variant Types:**
1. **Direct pain variant:** Lead with their specific pain point
2. **Trigger variant:** Lead with the trigger signal (what caught our attention)
3. **Social proof variant:** Lead with similar company/use case (if available)

**Message Structure (Email):**

Rotate structures to avoid pattern detection. Don't use the same format for every target.

**Structure A — Question-First:**
```
Subject: [Specific question about their situation]

Hi [First Name],

[Question that shows you understand their context]

[Why you're asking — connects to what you do]

[One specific proof point]

[Concrete CTA: specific time, deliverable, or next step]

[Signature]
```

**Structure B — Observation-First:**
```
Subject: [Observation about their business]

Hi [First Name],

[Share what you noticed about their situation — show you did homework]

[Ask if you're reading it right]

[Brief connection to how you help]

[Concrete CTA]

[Signature]
```

**Structure C — Direct-First (for busy execs):**
```
Subject: [Straight to the point]

Hi [First Name],

[One sentence: what they're doing + what you do + why it connects]

[One proof point]

[Concrete CTA]

[Signature]
```

**Message Structure (LinkedIn):**
```
Hi [First Name],

[One sentence that shows you read something specific — NOT "Congrats on X"]

[What you do, framed as relevant to them]

[Low-commitment but specific ask]

[Name]
```

### Step 4: Apply Messaging Rules

**Length:**
- Keep emails under 150 words
- Keep LinkedIn messages under 75 words

**Banned Phrases (Dead Giveaways for Automated Outreach):**
- "I wanted to reach out" / "I hope this finds you well"
- "Congrats on [trigger]!" as an opener (everyone does this — show you actually read the news instead)
- "revolutionize" / "game-changing" / "seamless"
- "Worth a quick call?" / "Would you be open to..." (hedging CTAs)
- "Similar companies" / "Clients typically" (vague social proof)

**Required:**
- Reference the specific trigger or pain
- Use the buyer's name and title correctly
- Match formality to the persona (CFO = more formal, Founder = more casual)
- Include ONE specific CTA — not "15-minute call" but an actual time slot, a one-pager offer, or a Loom video. Be concrete.
- Vary proof points across messages — don't use "same-day settlement" and "3-5% savings" in every email. Rotate.

**Social Proof Rules:**
- If you can name a customer, name them
- If you can't, be specific about the *type*: "A 200-person Series B fintech scaling from MX to CO" beats "similar companies"
- One specific detail beats three vague claims

### Step 5: Check Skip Rules
Before finalizing a message:
- [ ] Message references specific trigger or pain (not generic)
- [ ] Message connects pain to product (not just product pitch)
- [ ] CTA is clear and low-commitment
- [ ] Length is within limits
- [ ] Tone matches buyer persona
- [ ] No hyperbolic language

### Step 6: Format for Handoff
Organize messages by target:

```markdown
## Messaging for [Target Company]

**Target:** [Company Name]
**Buyer:** [Name, Title]
**Trigger:** [Signal]
**Pain Hypothesis:** [Pain]
**BU:** [Bitwage / TeamPay / Mining]

---

### Email Variant A — Pain-Led

**Subject:** [Subject line]

[Body]

---

### Email Variant B — Trigger-Led

**Subject:** [Subject line]

[Body]

---

### LinkedIn Message

[Body]

---

### Notes for Sender
- [Any context about timing, tone, or approach]
- [Personalization suggestions if sender knows target]
```

---

## Decision Rules

### Skip / Flag
- If pain hypothesis is vague ("general payment friction") → flag for human refinement
- If no clear product-pain connection exists → flag, do not force a message
- If trigger is weak or unclear → lean harder on pain in messaging
- If buyer is very senior (C-suite) → use more formal tone, shorter message

### Variant Selection Guidance
- If trigger is very strong (funding, hiring spike) → lead with Trigger Variant
- If pain is explicitly stated (CFO quoted) → lead with Direct Pain Variant
- If similar company success story exists → lead with Social Proof Variant
- Default to Direct Pain Variant if unsure

---

## Example Run

**Date:** Tuesday, January 28, 2026

### Pain-to-Product Map (This Week's Thesis: LATAM Fintech Series A Recipients)

| Pain Point | Product Feature | Value Prop | Proof Point |
|------------|-----------------|------------|-------------|
| Scaling LATAM contractor payments after funding | Bitwage contractor payment rails | Pay LATAM contractors same-day with stablecoin rails | "Clients scale from 10 to 100 contractors without payment friction" |
| FX costs eating into runway | Bitwage competitive FX rates | Save 3-5% on cross-border payments vs. traditional banks | "Average client saves $X per contractor/month" |
| Managing compliance across LATAM countries | Bitwage unified platform | One platform, all LATAM countries, compliant contractor payments | "Support 15+ LATAM markets from single dashboard" |

---

## Messaging for PayFlow

**Target:** PayFlow
**Buyer:** Maria Santos, VP Finance
**Trigger:** Series A ($12M) for LATAM expansion, Jan 15
**Pain Hypothesis:** Scaling LATAM team, likely adding contractors rapidly
**BU:** Bitwage

---

### Email Variant A — Question-First

**Subject:** How are you handling contractor payments in BR and MX?

Hi Maria,

Expanding into Brazil and Mexico means paying contractors in two new currencies with two different banking quirks. Curious how PayFlow is setting that up — building vendor relationships in each country, or looking for something unified?

We run contractor payments for a few Series A fintechs doing the same LATAM expansion. One cut their wire costs by $40K in the first year just by dropping SWIFT.

Free for 20 minutes Thursday afternoon? Happy to share what's worked for others in your situation.

Best,
[Name]

---

### Email Variant B — Observation-First

**Subject:** PayFlow's LATAM expansion

Hi Maria,

Noticed PayFlow's $12M is going toward Brazil and Mexico — that's a different beast than single-country ops. FX on contractor payments alone probably eats more margin than you'd expect.

Am I reading that right? If cross-border payroll is on your radar, I can send a one-pager on how we've helped similar-stage fintechs handle it.

Best,
[Name]

---

### LinkedIn Message

Hi Maria,

Saw PayFlow's raising for BR and MX expansion — two very different payroll puzzles. We handle contractor payments for fintechs doing exactly this. Want me to send over a quick breakdown of how it works?

[Name]

---

### Notes for Sender
- Maria has been at PayFlow for 3 years, promoted to VP last year
- She posted about hiring challenges 2 months ago — reference this if you've built any rapport
- LinkedIn first, then email follow-up if no response

---

## Messaging for DataSync Inc

**Target:** DataSync Inc
**Buyer:** John Chen, Head of People
**Trigger:** Hiring 15 contractors in MX/CO, Jan 22
**Pain Hypothesis:** Active FX friction with contractor payments
**BU:** Bitwage

---

### Email Variant A — Direct-First

**Subject:** 15 contractors in MX and CO

Hi John,

You're adding 15 contractors across Mexico and Colombia. We handle LATAM contractor payments — money lands same-day, no wire delays, no explaining to contractors why they're still waiting.

A 120-person company we work with dropped their bank's 4% FX spread and saved enough to fund another contractor hire.

Can I send you a 2-minute Loom showing how it works?

Best,
[Name]

---

### Email Variant B — Question-First

**Subject:** Quick question about your MX/CO contractor setup

Hi John,

Adding 15 contractors in two countries at once — are you setting up local bank relationships in each, or running everything through your US bank?

Asking because we've seen both approaches, and there's a real cost difference. Happy to share what a similar-sized company did if it's useful.

Best,
[Name]

---

### LinkedIn Message

Hi John,

15 contractors across MX and CO is a lot to onboard at once — especially the payment side. We handle that for companies your size. Want me to send a quick breakdown of how it works?

[Name]

---

### Notes for Sender
- John is active on LinkedIn, responds to DMs
- DataSync has 120 employees — likely outgrowing whatever contractor payment process they have
- Time your message after their Feb 1 payroll cycle when the pain is fresh

---

## Quality Checklist

Before handing off messaging:
- [ ] Every target has 2-3 message variants
- [ ] Every message references specific trigger or pain
- [ ] Every message connects pain to product value
- [ ] Every message has clear, single CTA
- [ ] Email messages are under 150 words
- [ ] LinkedIn messages are under 75 words
- [ ] Tone matches buyer persona
- [ ] No hyperbolic or generic language
- [ ] Notes for sender included where relevant
