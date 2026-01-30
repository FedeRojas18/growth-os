# Apollo CSV Exporter

## Description
Generates Apollo.io-compatible CSV files with proper formatting, validation, and BU-specific splitting for the Growth OS v3 workflow.

## Purpose
Use this skill when you need to export target lists to Apollo-ready CSV format with:
- Proper column mapping for Apollo import
- BU-specific file splitting (Bitwage, TeamPay, Mining)
- Data validation and enrichment gap flagging
- Sequence-ready message formatting

## Capabilities

### 1. CSV Generation
- Creates Apollo-compatible CSV files with required columns
- Handles proper escaping and formatting for special characters
- Validates required fields (First Name, Last Name, Company, etc.)
- Flags missing optional fields (Email, Company Size, HQ)

### 2. BU Splitting
- Automatically splits targets by Business Unit
- Creates separate files: `{date}-bitwage-apollo.csv`, `{date}-teampay-apollo.csv`, etc.
- Maintains consistent column structure across all BU files

### 3. Data Validation
- Checks for duplicate targets within export
- Validates trigger dates are within acceptable windows
- Ensures all targets have valid triggers
- Reports enrichment gaps without blocking export

## Schema

### Apollo CSV Columns
```csv
First Name,Last Name,Email,LinkedIn URL,Company,Title,Company Size,Company HQ,Trigger,Trigger Date,Pain Hypothesis,BU,Notes
```

### Required Fields
- First Name
- Last Name
- Company
- Title
- LinkedIn URL
- Trigger
- Trigger Date
- Pain Hypothesis
- BU

### Optional Fields (flagged if missing)
- Email
- Company Size
- Company HQ
- Notes

## Usage

When you need to export targets to Apollo:

1. Provide target list with all available data
2. Specify export date for filename
3. Indicate which BUs have targets
4. Include any enrichment gaps to flag

The skill will:
- Generate properly formatted CSV(s)
- Split by BU if multiple BUs exist
- Create validation report
- Output files to `/exports/weekly/{date}/`

## Example

```python
targets = [
    {
        "first_name": "John",
        "last_name": "Smith",
        "email": "[Research Needed]",  # Flagged but included
        "linkedin_url": "https://linkedin.com/in/johnsmith",
        "company": "ACME Corp",
        "title": "CFO",
        "company_size": "100-500",
        "company_hq": "São Paulo, Brazil",
        "trigger": "Hiring LATAM contractors",
        "trigger_date": "2026-01-15",
        "pain_hypothesis": "Cross-border payroll friction for LATAM team",
        "bu": "Bitwage",
        "notes": "Active on Bitcoin Twitter"
    }
]

# Generates: 2026-01-29-bitwage-apollo.csv
```

## Integration Points

- **Module 5: Apollo Exporter** - Primary integration
- **Module 6: BU Pack Generator** - Uses output for BU splitting
- **Module 8: Pipeline Syncer** - Provides data for Sheets import

## Validation Rules

1. **Email Format**: Must be valid email or "[Research Needed]"
2. **LinkedIn URL**: Must start with "https://linkedin.com/"
3. **Trigger Date**: Must be within trigger age window (30-60 days)
4. **BU**: Must be one of: Bitwage, TeamPay, Mining
5. **Required Fields**: Cannot be empty/null

## Error Handling

- **Missing Required Field**: Skip target, report in validation log
- **Invalid Date**: Flag and use current date
- **Duplicate Target**: Keep first occurrence, report duplicate
- **Invalid BU**: Skip target, report invalid BU value

## Configuration

Located in: `config/export-formats.yaml`

```yaml
apollo_csv:
  columns:
    - first_name
    - last_name
    - email
    - linkedin_url
    - company
    - title
    - company_size
    - company_hq
    - trigger
    - trigger_date
    - pain_hypothesis
    - bu
    - notes

  required_fields:
    - first_name
    - last_name
    - company
    - title
    - linkedin_url
    - trigger
    - trigger_date
    - pain_hypothesis
    - bu

  flag_if_missing:
    - email
    - company_size
    - company_hq
```

## Output Structure

```
/exports/weekly/2026-01-29/
├── 2026-01-29-all-targets.csv           # Combined export
├── 2026-01-29-bitwage-apollo.csv        # Bitwage targets only
├── 2026-01-29-teampay-apollo.csv        # TeamPay targets only
├── 2026-01-29-mining-apollo.csv         # Mining targets only (if applicable)
└── 2026-01-29-validation-report.md      # Enrichment gaps & issues
```

## Notes

- This skill uses native Python `csv` module (no external dependencies)
- Enrichment gaps are flagged but do NOT block exports
- All exports include a validation report
- CSV files are ready for direct import to Apollo.io
