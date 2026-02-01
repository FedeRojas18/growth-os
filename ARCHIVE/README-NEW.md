> Archived on February 1, 2026. Superseded by /README.md. Kept for historical reference.

# Growth OS v3

**Bitcoin Ecosystem Channel Operating System**

> A complete, AI-assisted operating system for running the Bitcoin Ecosystem growth channel at Paystand.

---

## 🎯 What is This?

Growth OS v3 is an operational framework for:
- **Signal scanning** from Bitcoin/LATAM/fintech sources
- **Thesis selection** and target segmentation
- **Target research** with buyer enrichment
- **Message generation** for outreach
- **Apollo CSV exports** for sales tools
- **Partner brief** generation
- **Pipeline tracking** and weekly reporting

## 🚀 Quick Start

### First Time Setup (5 minutes)
1. **Read the guide**: [DOCS/GETTING-STARTED.md](DOCS/GETTING-STARTED.md)
2. **Update emails**: Edit `SYSTEM/config/stakeholders.yaml`
3. **Run signal scan**: Tell Claude "Run Signal Scanner for this week"

### Weekly Workflow
| Day | Activity | Time |
|-----|----------|------|
| **Monday** | Signal Scanner → Thesis Selection | 4 hrs |
| **Tuesday** | Target Builder → Messages → Apollo Export | 4 hrs |
| **Wednesday** | Partner Briefs & Pipeline Check-ins | 4 hrs |
| **Thursday** | Deep Research & Knowledge Updates | 3 hrs |
| **Friday** | Pipeline Update → Channel Report | 3 hrs |

---

## 📁 Repository Structure

```
growth-os/
├── 📚 DOCS/              All documentation & specifications
│   ├── GETTING-STARTED.md
│   ├── growth-os-v3-spec.md
│   ├── skills-tooling-map.md
│   └── archive/          Old versions
│
├── 🎯 SYSTEM/            Core operating system
│   ├── agents/           Working v2.1 agents
│   ├── modules/          v3 module specifications
│   ├── config/           All YAML configuration
│   └── skills/           Custom skills
│
├── 📊 KNOWLEDGE/         Reference & context
│   ├── ecosystem-guide.md
│   ├── roi-metrics.md
│   ├── experiments.md
│   └── sources.md
│
├── 📋 TEMPLATES/         Reusable templates
│   ├── partner-brief.md
│   ├── weekly-report.md
│   └── test-plan.md
│
├── 🗂️ WORK/              Active work & history
│   ├── weekly/           Weekly execution (by week number)
│   ├── partners/         Partner briefs
│   └── history/          Target deduplication
│
├── 📤 EXPORTS/           Generated deliverables
│   ├── weekly/           Apollo CSVs, messages
│   ├── partners/         Partner PDFs
│   └── reports/          Channel reports
│
└── 🗄️ ARCHIVE/           Completed projects
    ├── bitcoin-events-2026/
    └── jga-role-definition/
```

---

## 🎬 How to Use

The system is fully conversational. Just tell Claude what you need:

### Examples

**Start your week:**
```
"Run Signal Scanner for this week"
"Select a thesis from the signal digest"
"Build target list for [thesis name]"
```

**Generate deliverables:**
```
"Generate Apollo CSV export for Bitwage"
"Create partner brief for Circle"
"Generate weekly channel report"
```

**Research:**
```
"Research Bitcoin treasury companies"
"Find LATAM companies hiring contractors"
"Scan for stablecoin adoption signals"
```

---

## 📖 Key Documentation

| Document | Purpose |
|----------|---------|
| [GETTING-STARTED.md](DOCS/GETTING-STARTED.md) | Complete startup guide |
| [growth-os-v3-spec.md](DOCS/growth-os-v3-spec.md) | Full system specification |
| [skills-tooling-map.md](DOCS/skills-tooling-map.md) | Capabilities & skills reference |
| [skills-installation-report.md](DOCS/skills-installation-report.md) | Installed skills inventory |

---

## ⚙️ Configuration

All configuration lives in `SYSTEM/config/`:

| File | Purpose | Status |
|------|---------|--------|
| `triggers.yaml` | Valid trigger library | ✅ Ready |
| `segments.yaml` | Pre-vetted segments | ✅ Ready |
| `sources.yaml` | Signal sources | ✅ Ready |
| `bu-positioning.yaml` | BU value props | ✅ Ready |
| `stakeholders.yaml` | Routing rules | ⚠️ Update emails |
| `export-formats.yaml` | Apollo CSV schema | ✅ Ready |

**Action Required**: Update team emails in `stakeholders.yaml`

---

## 🔧 System Status

### ✅ Fully Operational
- Signal scanning & filtering
- Target research & enrichment
- Message generation
- CSV exports
- Partner brief generation
- Weekly reporting

### ⚠️ Manual (Works, Not Automated)
- Apollo CSV generation (I create manually)
- BU pack splitting (I split manually)
- Weekly workflow chaining (run each step)

### 📋 Pending Configuration
- Slack webhook notifications
- Google Sheets API integration
- PDF scoreboard generation
- PPTX slide deck generation

---

## 🛠️ Installed Skills

**Critical Path** (Installed & Ready):
- `pdf` - PDF generation
- `pptx` - PowerPoint generation
- `xlsx` - Excel/CSV with formulas

**Enhancement** (Installed, Needs Config):
- `slack-webhook` - Slack notifications
- `google-sheets` - Google Sheets API
- `firecrawl` - Web scraping
- `resend` - Email automation
- `linkedin` - LinkedIn enrichment

**Custom** (Project-Specific):
- `apollo-csv-exporter` - CSV validation
- `signal-aggregator` - Signal scanning
- `target-enrichment` - Data enrichment

---

## 📊 Deliverables

### Weekly (Every Tuesday)
- Bitwage Apollo CSV + Messages
- TeamPay Apollo CSV + Messages
- Mining Apollo CSV + Messages (if applicable)
- Weekly brief for operator

### Partners (On-Demand)
- One-page PDF brief
- LinkedIn intro script
- Email intro script

### Reports (Every Friday)
- Slack heartbeat
- PDF scoreboard (when configured)
- PPTX slide deck (when configured)

---

## 🤝 Stakeholders

| Stakeholder | Role | Receives | Channel |
|-------------|------|----------|---------|
| Ramiro/Jonathan | Bitwage SDR | Apollo CSVs, Messages | #bitwage-outbound |
| Meridith/Morgan | TeamPay SDR | Apollo CSVs, Messages | #teampay-outbound |
| Alexandra | Mining Partners | Target lists, Briefs | DM |
| Christian | Partnerships VP | Strategic briefs | DM |
| Channel Team | Reporting | Reports, Scorecards | #bitcoin-channel |

---

## 💡 Tips

### For Best Results
- Be specific with requests: "Find 10 Bitcoin treasury companies that raised funding in last 60 days"
- Reference configs: "Use the LATAM expansion segment from segments.yaml"
- Iterate: "Add 5 more targets" or "Regenerate with different messaging"

### Workflow Shortcuts
```
"Run Monday workflow" → Signal scan + Thesis selection
"Run Tuesday workflow" → Targets + Messages + Export
"Run Friday workflow" → Pipeline update + Report
```

### Common Tasks
```
"Show me this week's progress"
"What's in the pipeline?"
"Generate next week's test plan"
"Update target history with new contacts"
```

---

## 🆘 Support

**Issues?**
1. Check [DOCS/GETTING-STARTED.md](DOCS/GETTING-STARTED.md)
2. Review [DOCS/growth-os-v3-spec.md](DOCS/growth-os-v3-spec.md)
3. Just ask Claude!

**Questions?**
The system is designed to understand natural language. If you're not sure how to do something, just describe what you want in plain English.

---

## 📜 Version History

- **v3.0** (Jan 2026) - Role-based execution system with import-ready deliverables
- **v2.1** (2025) - Agent-based workflow system
- **v1.0** (2025) - Initial markdown-based system

---

**Ready to start?** Run your first signal scan:
```
"Run Signal Scanner for the week of [today's date]"
```

🚀 Let's build pipeline!
