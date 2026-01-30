# Signal Aggregator

## Description
Scans, filters, and aggregates growth signals from multiple sources for the Bitcoin Ecosystem Growth OS, producing actionable signal digests with clear action mappings.

## Purpose
Use this skill when running the Signal Scanner module (Module 1) to:
- Scan configured sources for actionable signals
- Filter signals by recency, relevance, and action potential
- Map signals to action types (Thesis Candidate, Trigger Target, Partner Lead)
- Produce weekly signal digest with recommendations

## Signal Sources

### Configured Sources (from `config/sources.yaml`)
1. **News & Media**
   - TechCrunch (Bitcoin, fintech, LATAM)
   - CoinDesk (stablecoins, regulation, institutional adoption)
   - The Block (funding rounds, partnerships)
   - Bitcoin Magazine (ecosystem news)

2. **Social & Community**
   - Bitcoin Twitter (key influencers, company announcements)
   - LinkedIn (hiring, expansion, funding announcements)
   - Reddit r/Bitcoin, r/bitcoinbeginners

3. **Industry Sources**
   - LATAM fintech newsletters
   - Mining industry publications
   - Stablecoin integration announcements

4. **Event & Conference Feeds**
   - Bitcoin conferences (speakers, sponsors)
   - LATAM fintech events
   - Mining conferences

## Signal Filtering Rules

### Recency Filter
- Signal must be <7 days old
- Exception: Funding rounds can be up to 60 days old
- Exception: Regulatory news can be up to 30 days old

### Relevance Filter
Signal must relate to:
- Specific company or person (not generic industry trends)
- Identifiable buyer or decision maker
- Clear trigger or pain point
- Path to Growth OS segments (LATAM expansion, Bitcoin adoption, etc.)

### Action Mapping
Each signal must map to exactly ONE action:
- **Thesis Candidate**: Suggests new targeting segment
- **Trigger Target**: Specific company with actionable trigger
- **Partner Lead**: Partnership opportunity
- **Drop**: Interesting but no clear action

## Signal Digest Format

```markdown
# Weekly Signal Digest — Week of [DATE]

## Summary
- Total signals scanned: [N]
- Actionable signals: [N]
- Top recommended action: [Thesis/Target/Partner]

---

## Thesis Candidates (Segment Opportunities)

| Signal | Source | Date | Proposed Segment |
|--------|--------|------|------------------|
| Brazil stablecoin regulation finalized | CoinDesk | 2026-01-22 | Brazil stablecoin adopters |
| ... | ... | ... | ... |

---

## Trigger Targets (Ready for Outreach)

| Company | Signal | Trigger Type | Source | Date | BU Fit |
|---------|--------|--------------|--------|------|--------|
| ACME Corp | Hiring LATAM contractors | Hiring | LinkedIn | 2026-01-25 | Bitwage |
| ... | ... | ... | ... | ... | ... |

---

## Partner Leads (Partnership Opportunities)

| Partner | Signal | Opportunity Type | Source | Date | Owner |
|---------|--------|------------------|--------|------|-------|
| Lightning Labs | Payment rail integration | Tech Partner | Twitter | 2026-01-23 | Christian |
| ... | ... | ... | ... | ... | ... |

---

## Dropped Signals (Interesting but No Action)

| Signal | Source | Reason Dropped |
|--------|--------|----------------|
| General BTC price movement | CoinDesk | No specific company/person |
| ... | ... | ... |

---

## Recommended Action

**Top Priority**: [Thesis Candidate / Trigger Target / Partner Lead]
**Reasoning**: [Why this signal has highest conversion potential]
```

## Scope Guardrails

Apply these filters to maintain focus:

1. **Signal Density**: Segment must have ≥3 trigger-qualified companies
2. **Buyer Clarity**: Must identify specific buyer persona
3. **Path to Pipeline**: Clear conversion path (outreach → meeting → opportunity)

Signals that fail guardrails → "Dropped Signals" section

## Integration with Other Modules

### Feeds Into
- **Module 2: Thesis Selector** - Thesis candidate signals
- **Module 3: Target Builder** - Trigger target signals
- **Module 7: Partner Brief** - Partner lead signals

### Data Sources
- `config/sources.yaml` - Source URLs and scan instructions
- `knowledge/ecosystem-guide.md` - Context for relevance filtering
- Previous week's thesis - Continuity context

## Usage

When running Signal Scanner:

1. Provide the date range (typically last 7 days)
2. Include previous week's thesis for context
3. Specify any urgent signals to prioritize

The skill will:
- Scan all configured sources
- Apply filtering rules
- Generate action mapping
- Produce signal digest
- Highlight top recommended action

## Example Workflow

```
Input: "Scan signals for week of 2026-01-29"

Process:
1. Scan news sources (TechCrunch, CoinDesk, etc.)
2. Scan social media (Twitter, LinkedIn)
3. Filter by recency (<7 days)
4. Filter by relevance (company/person specific)
5. Map to actions (Thesis/Target/Partner)
6. Apply scope guardrails
7. Generate digest with recommendations

Output: Signal digest markdown file
```

## Signal Quality Scoring

Each actionable signal scores on:
- **Trigger Strength** (30%): How compelling is the trigger?
- **Buyer Clarity** (25%): Can we identify the buyer?
- **Signal Freshness** (20%): How recent is the signal?
- **BU Fit** (15%): How well does it fit our BUs?
- **Conversion History** (10%): Have similar signals converted?

Signals scoring >70% are prioritized.

## Configuration

Located in: `config/sources.yaml`

```yaml
sources:
  - name: TechCrunch
    url: https://techcrunch.com/
    categories: [bitcoin, fintech, latam]
    scan_frequency: daily
    relevance_keywords:
      - funding
      - expansion
      - latam
      - bitcoin
      - stablecoin

  - name: Bitcoin Twitter
    type: manual_review
    accounts:
      - @Bitcoin
      - @aantonop
      - @saifedean
    scan_frequency: daily

  # ... more sources
```

## Notes

- Uses native WebFetch and WebSearch tools
- Can integrate with Firecrawl skill for structured scraping
- Twitter/X scanning remains manual (no reliable API)
- Signals are never auto-converted to targets without human approval
