# Module 5: Apollo Exporter

## Purpose
Transform target list + messages into Apollo-ready CSV format for direct import.

## Trigger
- After Module 4 (Message Generator) completes
- Automatic (no approval gate)

## Inputs
- Target list from Module 3 (enriched targets)
- Messages from Module 4 (email & LinkedIn variants)
- `config/export-formats.yaml` — Column mappings

## Outputs
- `exports/weekly/{date}/{date}-all-targets.csv` — Full Apollo import file
- `exports/weekly/{date}/{date}-sequences.md` — Message templates by sequence step
- `exports/weekly/{date}/{date}-validation-report.md` — Enrichment gaps & issues

## Process

### 1. Load Target Data
Read enriched target list with fields:
- Company, Website, HQ, Size, Stage
- Buyer: First Name, Last Name, Title, LinkedIn URL, Email
- Trigger, Trigger Date, Trigger Source
- Pain Hypothesis, BU Fit
- Notes

### 2. Transform to Apollo Schema

Map to Apollo CSV columns per `config/export-formats.yaml`:

```csv
First Name,Last Name,Email,LinkedIn URL,Company,Title,Company Size,Company HQ,Trigger,Trigger Date,Pain Hypothesis,BU,Notes
```

### 3. Validate Data

For each target, check:
- ✅ Required fields present (First Name, Last Name, Company, Title, LinkedIn URL, Trigger, Trigger Date, Pain Hypothesis, BU)
- ⚠️ Flag if missing: Email, Company Size, Company HQ
- ❌ Skip if missing: Buyer name, LinkedIn URL, or valid trigger

### 4. Handle Enrichment Gaps

- **Missing Email**: Flag as `[Research Needed]`, include target
- **Missing Company Size**: Flag as `[Unknown]`, include target
- **Missing HQ**: Flag as `[Unknown]`, include target
- **Missing Buyer**: SKIP target (cannot outreach)
- **Invalid Trigger**: SKIP target (no qualification)

### 5. Generate Apollo CSV

Use **apollo-csv-exporter** skill or native Python csv module:

```python
import csv
from datetime import datetime

targets = [...]  # Enriched target list

filename = f"exports/weekly/{datetime.now().strftime('%Y-%m-%d')}/{datetime.now().strftime('%Y-%m-%d')}-all-targets.csv"

with open(filename, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'First Name', 'Last Name', 'Email', 'LinkedIn URL',
        'Company', 'Title', 'Company Size', 'Company HQ',
        'Trigger', 'Trigger Date', 'Pain Hypothesis', 'BU', 'Notes'
    ])
    writer.writeheader()
    writer.writerows(targets)
```

### 6. Generate Sequence Messages

Create markdown file with message templates organized by sequence step:

```markdown
# Apollo Sequences — Week of {date}

## Day 0: LinkedIn Connect Request
[For each target, include LinkedIn message]

## Day 2: Email Variant A
[For each target, include email subject + body]

## Day 5: Email Variant B
[For each target, include email subject + body]

## Day 10: Final Follow-up
[For each target, include follow-up subject + body]
```

### 7. Generate Validation Report

Document enrichment gaps and skipped targets:

```markdown
# Validation Report — {date}

## Summary
- Total targets processed: {N}
- Targets included: {N}
- Targets skipped: {N}
- Enrichment gaps flagged: {N}

## Enrichment Gaps
| Company | Buyer | Missing Field | Included? |
|---------|-------|---------------|-----------|
| ACME Corp | John Smith | Email | Yes ✅ |
| ... | ... | ... | ... |

## Skipped Targets
| Company | Skip Reason |
|---------|-------------|
| Example Co | No buyer identified |
| ... | ... |

## Recommendations
- Manual email research needed for {N} targets
- {N} targets skipped - consider expanding buyer search
```

## Approval Gate
None — automatic after Message Generator.

## Integration Points
- **Receives from Module 4** (Message Generator)
- **Feeds into Module 6** (BU Pack Generator)
- **Feeds into Module 8** (Pipeline Syncer) for initial "New" state

## Skill Integration
- Use **apollo-csv-exporter** skill for validation and formatting
- Use **xlsx** skill for Excel version (optional)
- Native Python csv module as fallback

## Output Files

```
exports/weekly/2026-01-29/
├── 2026-01-29-all-targets.csv         # Apollo import file
├── 2026-01-29-sequences.md            # Message templates
└── 2026-01-29-validation-report.md    # Gaps & issues
```

## Time Budget
30 minutes (automated)

## Success Metrics
- CSV validates in Apollo import preview
- All required fields populated
- Enrichment gaps flagged but not blocking
- <2 minutes to import to Apollo
