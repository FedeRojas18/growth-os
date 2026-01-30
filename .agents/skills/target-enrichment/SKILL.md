# Target Enrichment

## Description
Enriches target company and buyer data for the Growth OS v3 workflow, flagging enrichment gaps while ensuring targets proceed through the pipeline even with incomplete data.

## Purpose
Use this skill when running the Target Builder module (Module 3) to:
- Research target companies (website, HQ, size, stage)
- Find buyer contacts (name, title, LinkedIn, email)
- Validate triggers against trigger library
- Generate pain hypotheses based on triggers
- Flag enrichment gaps without blocking exports

## Enrichment Layers

### Layer 1: Company Data
Required fields:
- Company name
- Company website
- Industry/vertical

Enrichment targets:
- Headquarters location
- Company size (employee count or range)
- Stage (startup, growth, enterprise)
- Recent news/signals
- Tech stack (if available)

### Layer 2: Buyer Data
Required fields:
- Buyer name (First + Last)
- Buyer title
- Buyer LinkedIn URL

Enrichment targets:
- Buyer email address
- Buyer phone (optional)
- Buyer background
- Buyer's active topics (Twitter/LinkedIn)
- Reporting structure

### Layer 3: Trigger Validation
Required:
- Valid trigger from Trigger Library
- Trigger date within age window
- Trigger source/proof

Enrichment:
- Additional triggers (if found)
- Trigger details/context
- Trigger strength assessment

### Layer 4: Pain Hypothesis
Required:
- Pain hypothesis aligned with trigger
- BU fit (Bitwage/TeamPay/Mining)

Enrichment:
- Supporting evidence for pain
- Potential objections
- Competitive landscape

## Enrichment Workflow

```
1. START: Company name + trigger signal

2. COMPANY RESEARCH
   ├─ WebSearch: "{company} headquarters location"
   ├─ WebSearch: "{company} employee count"
   ├─ WebFetch: Company website/about page
   └─ Flag if missing: HQ, Size

3. BUYER DISCOVERY
   ├─ LinkedIn search: "{company} {title}" (manual)
   ├─ WebSearch: "{company} CFO LinkedIn"
   ├─ Flag if missing: Email, Phone
   └─ Note: [Research Needed] for missing fields

4. TRIGGER VALIDATION
   ├─ Check: Trigger in Trigger Library?
   ├─ Check: Trigger date within window?
   ├─ Check: Trigger source credible?
   └─ If invalid: SKIP target

5. PAIN HYPOTHESIS GENERATION
   ├─ Map: Trigger → Pain point
   ├─ Map: Pain → BU fit
   ├─ Generate: 1-sentence hypothesis
   └─ Validate: Aligns with BU positioning

6. OUTPUT: Enriched target or Skip report
```

## Enrichment Gap Handling

### Philosophy: Flag but Include
- **Missing Email**: Flag as "[Research Needed]", include target
- **Missing Company Size**: Flag as "[Unknown]", include target
- **Missing HQ**: Flag as "[Unknown]", include target
- **Missing Buyer**: SKIP target (cannot outreach without buyer)
- **Invalid Trigger**: SKIP target (no valid reason to reach out)

### Gap Flags

| Gap Type | Action | Export Impact |
|----------|--------|---------------|
| No email | Flag "[Research Needed]" | ✅ Include |
| No company size | Flag "[Unknown]" | ✅ Include |
| No HQ | Flag "[Unknown]" | ✅ Include |
| No buyer identified | SKIP | ❌ Exclude |
| No valid trigger | SKIP | ❌ Exclude |
| No pain hypothesis | SKIP | ❌ Exclude |

## Data Sources Priority

### For Company Data
1. Company website (most authoritative)
2. LinkedIn company page
3. Crunchbase/PitchBook (for startups)
4. News articles
5. Social media

### For Buyer Data
1. LinkedIn (primary source)
2. Company website (team/about page)
3. News articles (mentions)
4. Twitter/social media
5. Hunter.io / Apollo.io (if integrated)

### For Trigger Validation
1. Direct source (LinkedIn post, news article)
2. Company announcements
3. Event attendance (speaker lists)
4. Social media posts
5. Industry reports

## Output Format

### Enriched Target
```yaml
- company: "ACME Corp"
  website: "https://acmecorp.com"
  hq: "São Paulo, Brazil"
  size: "100-500"
  stage: "Growth"

  buyer_first_name: "Maria"
  buyer_last_name: "Silva"
  buyer_title: "CFO"
  buyer_linkedin: "https://linkedin.com/in/mariasilva"
  buyer_email: "[Research Needed]"  # Flagged gap

  trigger: "Hiring LATAM contractors"
  trigger_date: "2026-01-20"
  trigger_source: "LinkedIn job posting"
  trigger_age_days: 9

  pain_hypothesis: "Cross-border payroll friction for growing LATAM team"
  bu_fit: "Bitwage"

  enrichment_gaps:
    - "Email address not found - manual research needed"

  notes: "CFO active on fintech Twitter, recently spoke at LATAM Fintech Summit"
```

### Skipped Target
```yaml
- company: "Example Co"
  skip_reason: "No buyer identified"
  attempted_research:
    - "LinkedIn search: 'Example Co CFO' - no results"
    - "Website: No team page found"
    - "News search: No CFO mentioned"
```

## Integration Points

- **Module 3: Target Builder** - Primary integration
- **Module 5: Apollo Exporter** - Consumes enriched data
- **Module 8: Pipeline Syncer** - Tracks enrichment status

## Deduplication

Check against: `history/target-history.yaml` (90-day window)

```python
def is_duplicate(company_name, buyer_name, history):
    """
    Check if target was contacted in last 90 days
    """
    for entry in history:
        if (entry['company'].lower() == company_name.lower() and
            entry['buyer'].lower() == buyer_name.lower() and
            entry['days_since_contact'] <= 90):
            return True
    return False
```

## Enrichment Quality Scoring

Each target receives enrichment score:

- **Complete** (90-100%): All required + most optional fields
- **Good** (70-89%): All required + some optional fields
- **Acceptable** (50-69%): All required, minimal optional
- **Incomplete** (<50%): Missing required fields → SKIP

## Configuration

Located in: `config/triggers.yaml`

```yaml
triggers:
  - category: Hiring
    signal: "Posting roles in LATAM, remote-global payroll, international ops"
    best_bu: Bitwage
    age_window_days: 30

  - category: Funding
    signal: "Raised capital (especially fintech/crypto/LATAM focused)"
    best_bu: [Bitwage, TeamPay]
    age_window_days: 60

  # ... more triggers
```

## Usage

When enriching targets:

1. Provide company name and initial trigger signal
2. Specify target count (10-15 per week)
3. Include BU preferences if any

The skill will:
- Research company and buyer data
- Validate triggers
- Generate pain hypotheses
- Flag enrichment gaps
- Return enriched targets + skip report

## Example

```
Input:
- Company: "ACME Corp"
- Signal: "Hiring LATAM contractors (LinkedIn, Jan 20)"
- Target BU: Bitwage

Enrichment Process:
1. Company research → Found HQ, size, website
2. Buyer discovery → Found CFO on LinkedIn, email not found (flagged)
3. Trigger validation → Valid hiring trigger, 9 days old, within window
4. Pain hypothesis → Generated based on LATAM payroll pain
5. Output → Enriched target with 1 gap (email)

Result: Target INCLUDED with email flagged for research
```

## Notes

- Native capabilities cover most enrichment (WebSearch, WebFetch)
- LinkedIn skill can assist with buyer discovery
- Email gaps are acceptable - SDRs can research during outreach prep
- Enrichment is iterative - SDRs can add data during their process
- All gaps are tracked in validation reports for continuous improvement
