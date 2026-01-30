# Target Pipeline

> **Purpose:** Track target state from first contact through handoff
> **Update Frequency:** Tuesday (new targets) + Friday (state updates)
> **Used By:** Target List Builder (Agent 3), Weekly Exec Update (Agent 6)

---

## Pipeline States

| State | Definition | Exit Criteria | Max Time in State |
|-------|------------|---------------|-------------------|
| **New** | Target identified, not yet contacted | Outreach sent | 1 week |
| **Contacted** | Outreach sent, awaiting response | Reply received OR 3 follow-ups sent | 2 weeks |
| **Replied** | Response received, conversation active | Meeting scheduled OR clearly declined | 2 weeks |
| **Meeting** | Meeting scheduled or held | Qualified and passed to sales OR not qualified | 2 weeks |
| **Passed** | Qualified lead passed to sales team | Sales takes ownership | N/A (exit) |
| **Closed-Lost** | Not a fit, declined, or no response after follow-ups | Archived | N/A (exit) |
| **Nurture** | Interested but timing not right | Re-engage trigger identified | 90 days max |

---

## Pipeline Rules

### Rule 1: No Orphan Targets
Every target MUST have:
- A "Next Action" (specific, not vague)
- An "Owner" (who is responsible)
- A "Last Touch" date (when was last contact/action)

Orphan = target with blank Next Action. Orphans must be fixed every Friday.

### Rule 2: State Must Move or Close
- If a target is in the same state for >2 weeks → it must either advance or move to Closed-Lost/Nurture
- "Stuck" targets clog the pipeline and mask true conversion rates
- Friday review: Any target in same state >2 weeks gets escalated or closed

### Rule 3: Last Touch Must Be Current
- "Last Touch" = date of most recent action (email, call, LinkedIn, meeting)
- If Last Touch is >14 days old and state isn't Passed/Closed-Lost → flag for action

### Rule 4: Next Action Must Be Specific
- Good: "Send follow-up email with case study"
- Bad: "Follow up"
- Good: "Schedule call for week of Feb 3"
- Bad: "Set up meeting"

### Rule 5: Friday Pipeline Snapshot for Exec Update
Every Friday, calculate:
- Count by state (New, Contacted, Replied, Meeting, Passed)
- Change vs. last week (+/-)
- State changes this week (list of specific movements)

---

## Active Pipeline

| Company | BU Fit | Trigger | State | Last Touch | Channel | Next Action | Owner |
|---------|--------|---------|-------|------------|---------|-------------|-------|
| Pomelo | Bitwage | $55M Series C; stablecoin credit card launch | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Gastón Irigoyen | TBD |
| Plata | Bitwage | $250M Series B; payroll products + Colombia expansion | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Neri Tollardo | TBD |
| UY3 | Bitwage | New round negotiating; Brazil Feb 2 regs | New | 2026-01-28 | Email | Send trigger-led email to Tabaré Acosta (urgent: Feb 2 deadline) | TBD |
| Klar | Bitwage | $190M Series C; Bineo acquisition | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Juan Sarmiento | TBD |
| Ualá | Bitwage | $366M Series E; 3-country ops | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Pierpaolo Barbieri | TBD |
| Kapital | Bitwage | $100M Series C; LATAM AI unicorn | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Fernando Sandoval | TBD |
| Magie | Bitwage | $28M raised; AI fintech scaling | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Luiz Ramalho | TBD |
| Monet | Bitwage | Bancolombia alliance; 4-country expansion | New | 2026-01-28 | — | Research CEO name on LinkedIn before outreach | TBD |
| iCred | Bitwage | R$1.15B FIDC; payroll fintech | New | 2026-01-28 | — | Research CFO name on LinkedIn before outreach | TBD |
| DDC Enterprise | TeamPay | 1,683 BTC treasury; active accumulation | New | 2026-01-28 | — | Research CFO name on LinkedIn before outreach | TBD |
| Bitcoin Treasury Corp | TeamPay | CEO at Digital Asset Treasury Conference | New | 2026-01-28 | LinkedIn | Send LinkedIn message to Elliot Johnson (warm: event context) | TBD |
| American Bitcoin | TeamPay | 5,843 BTC; 17 BTC/day accumulation | New | 2026-01-28 | — | Research CFO name on LinkedIn before outreach | TBD |

<!--
INSTRUCTIONS:
- Add new targets every Tuesday after test plan ships
- Update states and Last Touch every Friday
- Move to Closed-Lost or Nurture if stuck >2 weeks with no progress
- Archive to Closed-Lost section when closing out
-->

---

## Pipeline Summary (Update Every Friday)

| State | Count | Change vs. Last Week |
|-------|-------|---------------------|
| New | 12 | +12 |
| Contacted | 0 | +0 |
| Replied | 0 | +0 |
| Meeting | 0 | +0 |
| Passed | 0 | +0 |

**State Changes This Week:**
- 12 new targets added from Week of Jan 27 test plan (LATAM Fintechs thesis)

---

## Closed-Lost Archive

| Company | BU Fit | Original Trigger | Closed Date | Reason |
|---------|--------|------------------|-------------|--------|
| [Company] | [BU] | [Trigger] | [Date] | [Why closed: no response, not a fit, competitor, etc.] |

---

## Nurture List

| Company | BU Fit | Original Trigger | Nurture Date | Re-engage Trigger | Check-in Date |
|---------|--------|------------------|--------------|-------------------|---------------|
| [Company] | [BU] | [Trigger] | [Date] | [What would make them ready] | [When to re-check] |

---

## Pipeline Health Metrics

Track these weekly:

| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Total active targets | 0 | 0 | — |
| State changes | 0 | 0 | — |
| Avg days in Contacted | — | — | — |
| Conversion: Contacted → Replied | — | — | — |
| Conversion: Replied → Meeting | — | — | — |

---

## Weekly Pipeline Review (Friday)

- [ ] All targets have Next Action filled in
- [ ] All targets have Last Touch within 14 days (or flagged)
- [ ] No targets stuck in same state >2 weeks (or moved to Closed-Lost/Nurture)
- [ ] Pipeline summary updated with counts and changes
- [ ] State changes documented for exec update
- [ ] Closed-Lost targets archived with reason
- [ ] Nurture list reviewed for re-engage opportunities
