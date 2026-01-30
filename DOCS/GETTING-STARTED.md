# Growth OS v3: Getting Started Guide

**Welcome to the Bitcoin Ecosystem Growth OS v3!**

This guide will help you start using the system immediately, even without external integrations configured.

---

## Quick Start (5 Minutes)

### 1. System Status Check

All core components are ready:
- ✅ All required skills installed
- ✅ Config files created
- ✅ Directory structure in place
- ✅ Module specifications ready

### 2. Run Your First Signal Scan (Monday)

```bash
# Navigate to project directory
cd /Users/frojas/bitcoin-ecosystem-analysis

# Start Claude Code and run:
# "Run Module 1: Signal Scanner for the week of [today's date]"
```

The system will:
1. Scan configured sources from `config/sources.yaml`
2. Filter signals by recency and relevance
3. Generate signal digest with action mapping
4. Output to `weekly-plans/{date}-signal-digest.md`

### 3. Select a Thesis (Monday)

After reviewing the signal digest:
```
# In Claude Code:
# "Run Module 2: Thesis Selector using the signal digest"
```

The system will:
1. Analyze thesis candidates from signal digest
2. Score against segment menu in `config/segments.yaml`
3. Recommend top 3 options
4. Wait for your approval

### 4. Build Target List (Monday-Tuesday)

Once thesis is approved:
```
# In Claude Code:
# "Run Module 3: Target Builder for [approved thesis]"
```

The system will:
1. Research 10-15 companies fitting the thesis
2. Enrich with buyer data
3. Validate triggers
4. Generate pain hypotheses
5. Output enriched target list

### 5. Generate Messages (Tuesday)

```
# In Claude Code:
# "Run Module 4: Message Generator for the target list"
```

The system will:
1. Create email variants (A & B) for each target
2. Create LinkedIn messages
3. Add sender notes
4. Output message templates

### 6. Export to Apollo (Tuesday)

```
# In Claude Code:
# "Run Module 5: Apollo Exporter"
```

The system will:
1. Generate Apollo-ready CSV files
2. Split by BU (Bitwage, TeamPay, Mining)
3. Create sequence message files
4. Generate validation report

### 7. Deliver to Stakeholders (Tuesday)

**Manual Delivery** (until Slack integration):
1. Check `exports/weekly/{date}/` directory
2. Send Bitwage pack to Ramiro/Jonathan
3. Send TeamPay pack to Meridith/Morgan
4. Send Mining pack to Alexandra (if applicable)

**Notification Message Template**:
```
🎯 [BU] Execution Pack Ready — Week of [date]

[N] targets ready for outreach.

Files attached:
• [BU]-apollo.csv (import to Apollo)
• [BU]-messages.md (sequence templates)

Key thesis: [thesis summary]
```

---

## Weekly Operating Cadence

### Monday (4 hours)
- **Morning**: Run Signal Scanner
- **Late Morning**: Review signals, select thesis
- **Afternoon**: Start Target Builder

### Tuesday (4 hours)
- **Morning**: Finish Target Builder
- **Midday**: Run Message Generator
- **Afternoon**: Run Apollo Exporter, BU Pack Generator
- **EOD**: Deliver packs to stakeholders

### Wednesday (4 hours)
- **Partner Brief generation** (1-2 partners)
- **Pipeline check-ins**
- **Ad-hoc target research**

### Thursday (3 hours)
- **Deep research** for next week
- **Experiment tracking**
- **Knowledge base updates**

### Friday (3 hours)
- **Pipeline updates** (Module 8)
- **Channel Report** (Module 9)
- **Weekly retrospective**

---

## Module Reference

### Available Modules

| # | Module | Status | Location |
|---|--------|--------|----------|
| 1 | Signal Scanner | ✅ Ready | `modules/signal-scanner.md` |
| 2 | Thesis Selector | ⚠️ Use `agents/segment-thesis-selector.md` | Existing agent |
| 3 | Target Builder | ⚠️ Use `agents/target-list-builder.md` | Existing agent |
| 4 | Message Generator | ⚠️ Use `agents/messaging-drafter.md` | Existing agent |
| 5 | Apollo Exporter | ✅ Ready | `modules/apollo-exporter.md` |
| 6 | BU Pack Generator | ✅ Ready | `modules/bu-pack-generator.md` |
| 7 | Partner Brief | ⚠️ Use `agents/partner-one-pager.md` | Existing agent |
| 8 | Pipeline Syncer | 📋 Manual | Google Sheets (manual update) |
| 9 | Channel Report | ⚠️ Use `agents/weekly-exec-update.md` | Existing agent |
| 10 | Experiment Tracker | 📋 Manual | `knowledge/experiment-log.md` |

### Running Modules

**Option 1: Natural Language** (Recommended)
```
# In Claude Code, simply say:
"Run Signal Scanner for this week"
"Build target list for [thesis]"
"Generate Apollo CSV export"
```

**Option 2: Direct Agent Reference**
```
# Reference specific agent files:
"Use the segment-thesis-selector agent to analyze these signals"
"Use the messaging-drafter agent to create outreach messages"
```

---

## Configuration Files

All configuration is in `config/` directory:

| File | Purpose | Status |
|------|---------|--------|
| `triggers.yaml` | Valid trigger library | ✅ Ready |
| `segments.yaml` | Pre-vetted segment menu | ✅ Ready |
| `sources.yaml` | Signal source URLs | ✅ Ready |
| `bu-positioning.yaml` | BU value props & messaging | ✅ Ready |
| `stakeholders.yaml` | Routing rules | ✅ Ready (update emails) |
| `export-formats.yaml` | Apollo CSV schema | ✅ Ready |

### Quick Edits Needed

**`config/stakeholders.yaml`** — Update email addresses:
```yaml
# Line 12, 22, 32, etc.
email: "ramiro@paystand.com"  # Replace example emails
```

---

## Directory Structure

```
bitcoin-ecosystem-analysis/
├── agents/                    # Existing agents (v2.1 compatibility)
├── modules/                   # v3 module specifications
├── config/                    # All configuration files ✅
├── templates/                 # Message & report templates
├── knowledge/                 # Ecosystem context & learnings
├── exports/                   # Generated outputs
│   ├── weekly/{date}/        # Weekly target packs
│   ├── partners/{name}/      # Partner briefs
│   └── reports/{date}/       # Channel reports
├── weekly-plans/             # Weekly execution artifacts
├── history/                  # Target deduplication log
└── skills/                   # Custom skills
```

---

## Common Workflows

### Workflow 1: Weekly Target Generation (Full Cycle)

```bash
# Monday morning
1. Run Signal Scanner
2. Review digest, select thesis
3. Start Target Builder

# Tuesday
4. Complete Target Builder
5. Run Message Generator
6. Run Apollo Exporter
7. Run BU Pack Generator
8. Deliver packs to stakeholders
```

### Workflow 2: On-Demand Partner Brief

```
# Any day (usually Wednesday)
"Generate partner brief for [Partner Name]"
```

Output:
- PDF brief (via pdf skill)
- LinkedIn intro script
- Email intro script

### Workflow 3: Weekly Channel Report

```
# Friday afternoon
"Generate weekly channel report"
```

Output:
- Slack heartbeat
- PDF scoreboard (via pdf skill)
- PPTX slide deck (via pptx skill)

---

## Skills Reference

### Installed Skills

**Critical Path:**
- `pdf` — PDF generation for briefs and reports
- `pptx` — PowerPoint slide generation
- `xlsx` — Excel/CSV with formatting

**Enhancement:**
- `slack-webhook` — Slack notifications (pending webhook URLs)
- `google-sheets` — Sheets API (pending credentials)

**Optional:**
- `firecrawl` — Web scraping (pending API key)
- `resend` — Email automation (pending API key)
- `linkedin` — LinkedIn enrichment (pending setup)

**Custom:**
- `apollo-csv-exporter` — Apollo CSV validation
- `signal-aggregator` — Signal scanning orchestration
- `target-enrichment` — Data enrichment with gap flagging

### Using Skills

Skills are invoked automatically when you run modules. You don't need to call them directly.

Example:
```
# This command...
"Generate Apollo CSV export"

# ...automatically uses:
# - apollo-csv-exporter skill for validation
# - Native CSV generation
# - xlsx skill for optional Excel version
```

---

## Troubleshooting

### Issue: "No signals found"
**Solution**: Check `config/sources.yaml` URLs are accessible. Try running on a different day when more news is available.

### Issue: "Enrichment gaps for all targets"
**Solution**: This is expected! Flag gaps as `[Research Needed]` and include targets anyway. SDRs will research during outreach prep.

### Issue: "No BU files generated"
**Solution**: Check if targets exist for that BU. Module 6 only creates files if targets exist for that BU.

### Issue: "Can't find target history"
**Solution**: `history/target-history.yaml` starts empty. It will populate as you add targets each week.

---

## Next Steps

### Immediate (This Week)
1. ✅ Run your first Signal Scanner
2. ✅ Generate first target list
3. ✅ Create first Apollo export
4. ✅ Deliver first BU packs

### Short-term (Next 2 Weeks)
1. Update stakeholder emails in `config/stakeholders.yaml`
2. Customize segments in `config/segments.yaml` based on results
3. Add/remove sources in `config/sources.yaml`

### Medium-term (Next Month)
1. Set up Slack webhooks for automated notifications
2. Configure Google Sheets API for pipeline sync
3. Optionally add Firecrawl API for better signal scanning

---

## Support & Documentation

- **Module Specs**: See `modules/` directory
- **Config Reference**: See `config/` directory
- **Skills Documentation**: See `.agents/skills/` for custom skills
- **v3 Specification**: See `bitcoin-ecosystem-growth-os-v3.md`
- **Skills Report**: See `SKILLS-INSTALLATION-REPORT.md`

---

## Questions?

The system is designed to be self-explanatory through natural language. Just describe what you want to do:

```
"I want to scan for signals this week"
"Generate a target list for LATAM fintech companies"
"Create a partner brief for Circle"
"Export targets to Apollo"
```

Claude Code will understand which modules to run and orchestrate the workflow.

---

**You're ready to go! Start with Signal Scanner and build your first target list.** 🚀
