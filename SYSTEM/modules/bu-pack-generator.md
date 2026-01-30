# Module 6: BU Pack Generator

## Purpose
Split Apollo export by Business Unit, package for stakeholder delivery.

## Trigger
- After Module 5 (Apollo Exporter) completes
- Automatic (no approval gate)

## Inputs
- Apollo CSV from Module 5
- Sequences markdown from Module 5
- `config/stakeholders.yaml` — Routing rules

## Outputs
- `exports/weekly/{date}/{date}-bitwage-apollo.csv` (if Bitwage targets exist)
- `exports/weekly/{date}/{date}-bitwage-messages.md` (if Bitwage targets exist)
- `exports/weekly/{date}/{date}-teampay-apollo.csv` (if TeamPay targets exist)
- `exports/weekly/{date}/{date}-teampay-messages.md` (if TeamPay targets exist)
- `exports/weekly/{date}/{date}-mining-apollo.csv` (if Mining targets exist)
- `exports/weekly/{date}/{date}-mining-messages.md` (if Mining targets exist)
- `exports/weekly/{date}/{date}-weekly-brief.md` — Operator summary

## Process

### 1. Load All Targets
Read `{date}-all-targets.csv` from Module 5

### 2. Split by BU
Group targets by `BU` column:
- Bitwage targets → `bitwage-apollo.csv`
- TeamPay targets → `teampay-apollo.csv`
- Mining targets → `mining-apollo.csv`

### 3. Split Messages
For each BU CSV, create corresponding messages file:
- Extract messages for targets in that BU
- Maintain sequence structure (Day 0, Day 2, Day 5, Day 10)
- Include sender notes specific to that BU

### 4. Generate BU-Specific Files

**Bitwage Pack** (if targets exist):
```
bitwage-apollo.csv         # Bitwage targets only
bitwage-messages.md        # Bitwage message templates
```

**TeamPay Pack** (if targets exist):
```
teampay-apollo.csv         # TeamPay targets only
teampay-messages.md        # TeamPay message templates
```

**Mining Pack** (if targets exist):
```
mining-apollo.csv          # Mining targets only
mining-messages.md         # Mining message templates
```

### 5. Generate Weekly Brief

Create operator summary: `{date}-weekly-brief.md`

```markdown
# Weekly Brief — {date}

## Target Distribution
- Bitwage: {N} targets
- TeamPay: {N} targets
- Mining: {N} targets
- **Total**: {N} targets

## Thesis
{Selected thesis from Module 2}

## Top Targets by BU

### Bitwage
1. {Company} - {Trigger} - {Buyer Title}
2. ...

### TeamPay
1. {Company} - {Trigger} - {Buyer Title}
2. ...

### Mining
1. {Company} - {Trigger} - {Buyer Title}
2. ...

## Enrichment Gaps Summary
- Emails needed: {N}
- Company sizes unknown: {N}
- HQs unknown: {N}

## Delivery Routing
- Bitwage pack → Ramiro/Jonathan (#bitwage-outbound)
- TeamPay pack → Meridith/Morgan (#teampay-outbound)
- Mining pack → Alexandra (DM)

## Next Steps
1. Import CSVs to Apollo
2. Load sequences into Apollo campaigns
3. Begin outreach Tuesday
```

### 6. Prepare for Notification

Generate notification payload for each BU (used by Notification Layer):

```yaml
bitwage_pack:
  target_count: 12
  csv_file: "2026-01-29-bitwage-apollo.csv"
  messages_file: "2026-01-29-bitwage-messages.md"
  recipients:
    - Ramiro
    - Jonathan
  channel: "#bitwage-outbound"

teampay_pack:
  target_count: 8
  csv_file: "2026-01-29-teampay-apollo.csv"
  messages_file: "2026-01-29-teampay-messages.md"
  recipients:
    - Meridith
    - Morgan
  channel: "#teampay-outbound"
```

## Routing Logic

Based on `config/stakeholders.yaml`:

| BU | Recipients | Notification Channel | Files |
|----|-----------|---------------------|-------|
| Bitwage | Ramiro, Jonathan | #bitwage-outbound + Email | CSV + Messages |
| TeamPay | Meridith, Morgan | #teampay-outbound + Email | CSV + Messages |
| Mining | Alexandra | DM + Email | CSV + Messages |

**If no targets for a BU**: Skip that pack (don't create empty files)

## File Structure

```
exports/weekly/2026-01-29/
├── 2026-01-29-all-targets.csv          # Full export (Module 5)
├── 2026-01-29-sequences.md             # All sequences (Module 5)
├── 2026-01-29-validation-report.md     # Gaps report (Module 5)
├── 2026-01-29-bitwage-apollo.csv       # Bitwage pack
├── 2026-01-29-bitwage-messages.md      # Bitwage messages
├── 2026-01-29-teampay-apollo.csv       # TeamPay pack
├── 2026-01-29-teampay-messages.md      # TeamPay messages
└── 2026-01-29-weekly-brief.md          # Operator summary
```

## Approval Gate
None — automatic after Apollo Exporter.

## Integration Points
- **Receives from Module 5** (Apollo Exporter)
- **Feeds into Notification Layer** (if configured)
- **Manual handoff** (if notifications not configured)

## Skill Integration
- Native Python/Bash for CSV splitting
- Native file operations for message extraction

## Time Budget
15 minutes (automated)

## Success Metrics
- BU files only created if targets exist
- All targets accounted for (sum of BU CSVs = total CSV)
- Messages correctly matched to targets
- Routing instructions clear in weekly brief
