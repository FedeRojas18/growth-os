# Target History

> **Purpose:** Running dedup log to prevent re-contacting targets
> **Update Frequency:** Every Tuesday after test plan ships
> **Used By:** Target List Builder (Agent 3)

---

## Dedup Rules

1. **Check before adding:** Before including any company in a weekly test plan, search this file
2. **90-day window:** If a company was contacted in the past 90 days → do not re-contact
3. **6-month Closed-Lost:** If a company is in Closed-Lost in the past 6 months → do not re-contact
4. **Exceptions:** If there's a new, strong trigger (e.g., new funding round, leadership change) → may override with human approval

---

## How to Use This File

### When Building Target List (Agent 3)
1. Search for company name before adding to list
2. If found → check "Date First Contacted"
3. If <90 days ago → SKIP
4. If >90 days ago → may consider re-engaging (human approval needed)

### When Updating (Every Tuesday)
1. Add all targets from this week's test plan
2. Include: Company, Date Added, Thesis, BU, Buyer, Outcome (update later)

---

## Target Log

| Company | Date Added | Date First Contacted | Thesis | BU | Buyer | Outcome | Notes |
|---------|------------|---------------------|--------|-----|-------|---------|-------|
| [Company] | [Date added to pipeline] | [Date first outreach] | [Thesis used] | [BU] | [Buyer name/title] | [Replied/Meeting/Closed-Lost/etc.] | [Any context] |

<!--
INSTRUCTIONS:
- Add new rows every Tuesday after test plan ships
- Update "Date First Contacted" when outreach is sent
- Update "Outcome" as target progresses through pipeline
- This is append-only — never delete rows (for historical record)
-->

---

## Quick Search Index

For faster dedup checking, maintain alphabetical index:

### A
- [No entries yet]

### B
- [No entries yet]

### C
- [No entries yet]

### D
- [No entries yet]

### E
- [No entries yet]

### F
- [No entries yet]

### G
- [No entries yet]

### H
- [No entries yet]

### I
- [No entries yet]

### J
- [No entries yet]

### K
- [No entries yet]

### L
- [No entries yet]

### M
- [No entries yet]

### N
- [No entries yet]

### O
- [No entries yet]

### P
- [No entries yet]

### Q
- [No entries yet]

### R
- [No entries yet]

### S
- [No entries yet]

### T
- [No entries yet]

### U
- [No entries yet]

### V
- [No entries yet]

### W
- [No entries yet]

### X
- [No entries yet]

### Y
- [No entries yet]

### Z
- [No entries yet]

---

## Statistics

Update monthly:

| Metric | Count |
|--------|-------|
| Total companies in history | 0 |
| Added this month | 0 |
| Unique theses used | 0 |
| Replied rate (historical) | 0% |
| Meeting rate (historical) | 0% |

---

## Notes

| Date | Note |
|------|------|
| [Date] | [Any observations about dedup patterns, common duplicates, etc.] |
