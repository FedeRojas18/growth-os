# Module 1: Signal Scanner

## Purpose
Scan all configured sources, filter for actionable signals, produce digest with action mapping.

## Trigger
- On-demand (Monday morning)
- Scheduled (weekly)
- Ad-hoc (for breaking signals)

## Inputs
- `config/sources.yaml` — Source URLs with scan instructions
- `knowledge/ecosystem-guide.md` — Context for relevance filtering
- Previous week's thesis — Continuity context

## Outputs
- **Signal digest** (markdown) with action mapping table
- Each signal tagged: Thesis Candidate | Trigger Target | Partner Lead | Drop

## Process

### 1. Scan Sources
For each source in `config/sources.yaml`:
- WebFetch or WebSearch for news/media sources
- Manual review prompts for social sources (Twitter, LinkedIn)
- Check event calendars for conference updates
- Optional: Use Firecrawl skill for structured scraping

### 2. Filter by Recency
- Signal must be <7 days old (default)
- Exception: Funding rounds up to 60 days
- Exception: Regulatory news up to 30 days
- Record signal date for validation

### 3. Filter by Relevance
Signal must meet ALL criteria:
- ✅ Relates to specific company or person
- ✅ Identifiable buyer or decision maker (preferred)
- ✅ Maps to Growth OS segments
- ✅ Clear trigger or pain point

Drop if:
- ❌ Generic industry trend without specific company
- ❌ No conversion path to pipeline
- ❌ Outside scope (no BU fit)

### 4. Action Mapping
For each qualifying signal, assign ONE action:

**Thesis Candidate**
- Signal suggests new targeting segment
- Multiple companies show similar pattern
- Example: "5 Brazil fintechs adopt stablecoin regulation"

**Trigger Target**
- Specific company with actionable trigger
- Trigger from Trigger Library
- Example: "ACME Corp hiring LATAM contractors"

**Partner Lead**
- Partnership opportunity with ecosystem player
- Mutual value potential
- Example: "Lightning Labs announces payment integration"

**Drop**
- Interesting but no clear action
- Log in ecosystem-guide.md for context

### 5. Apply Scope Guardrails
- **Signal Density**: Segment must have ≥3 companies
- **Buyer Clarity**: Can identify buyer persona
- **Path to Pipeline**: Clear outreach → meeting → opportunity path

Signals failing guardrails → "Dropped Signals"

### 6. Generate Digest

Create markdown file: `weekly-plans/{date}-signal-digest.md`

```markdown
# Weekly Signal Digest — Week of [DATE]

## Summary
- Total signals scanned: [N]
- Actionable signals: [N]
- Top recommended action: [Thesis/Target/Partner]

---

## Thesis Candidates (Segment Opportunities)

| Signal | Source | Date | Proposed Segment | Companies | Priority |
|--------|--------|------|------------------|-----------|----------|
| ... | ... | ... | ... | ... | ... |

---

## Trigger Targets (Ready for Outreach)

| Company | Signal | Trigger Type | Source | Date | BU Fit | Score |
|---------|--------|--------------|--------|------|--------|-------|
| ... | ... | ... | ... | ... | ... | ... |

---

## Partner Leads (Partnership Opportunities)

| Partner | Signal | Opportunity Type | Source | Date | Owner | Priority |
|---------|--------|------------------|--------|------|-------|----------|
| ... | ... | ... | ... | ... | ... | ... |

---

## Dropped Signals

| Signal | Source | Reason Dropped |
|--------|--------|----------------|
| ... | ... | ... |

---

## Recommended Action

**Top Priority**: [Most promising signal/segment]
**Reasoning**: [Why this has highest conversion potential]
**Next Step**: [Hand off to Thesis Selector or Target Builder]
```

## Approval Gate
Present digest to Fede for action selection and thesis approval.

## Integration Points
- **Feeds into Module 2** (Thesis Selector) - Thesis candidates
- **Feeds into Module 3** (Target Builder) - Trigger targets
- **Feeds into Module 7** (Partner Brief) - Partner leads

## Skill Integration
- Use **signal-aggregator** skill for orchestration
- Use **firecrawl** skill for structured web scraping (optional)
- Use native WebFetch/WebSearch for basic scanning

## Time Budget
4 hours (Monday morning)

## Success Metrics
- ≥10 actionable signals identified
- ≥1 high-priority thesis candidate or target segment
- 0 false positives (all signals pass relevance check)
