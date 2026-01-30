# Growth OS v3: Skills + Tooling Map

## Capability Scan Summary

This document analyzes every required deliverable in Growth OS v3, identifies the transformation steps needed to produce it, and maps what can be done natively vs. what requires additional skills/tools.

---

## Part 1: Deliverable-to-Transformation Analysis

### Transformation Pipeline Overview

```
RESEARCH → ENRICHMENT → MESSAGING → PACKAGING → REPORTING → TRACKING
    │           │            │           │            │           │
    ▼           ▼            ▼           ▼            ▼           ▼
 Signal     LinkedIn      Message    Apollo CSV    Slack       Google
 Scanning   Lookup        Drafting   PDF Brief    Heartbeat   Sheets
                          Sequences  PPTX Deck    PDF Report  Pipeline
```

---

## Part 2: Capability-by-Capability Assessment

### 2.1 Signal Scanner (Research Phase)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Scan news sources (TechCrunch, CoinDesk, etc.) | WebFetch tool | `firecrawl/cli@firecrawl` for structured scraping | **OPTIONAL** - WebFetch works |
| Scan Twitter/X for signals | Limited (no API) | Apify or Firecrawl | **GAP** |
| Scan LinkedIn for signals | Limited (no API) | `andrejones92/canifi-life-os@linkedin` | **GAP** |
| Parse and filter signals | ✅ Native (Claude) | None | Available |
| Action mapping logic | ✅ Native (Claude) | None | Available |

**Native Fallback:** Manual source review + WebFetch for public news sources.

---

### 2.2 Target Builder (Enrichment Phase)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Company research | ✅ WebFetch + WebSearch | None | Available |
| LinkedIn profile lookup | Limited | LinkedIn API or manual | **GAP** |
| Email discovery | ❌ None | Hunter.io, Apollo API, or manual | **GAP** |
| Trigger validation | ✅ Native (Claude) | None | Available |
| Pain hypothesis generation | ✅ Native (Claude) | None | Available |
| Dedup check | ✅ Native file operations | None | Available |

**Native Fallback:** Flag targets with `[Research needed]` for buyer LinkedIn/email.

---

### 2.3 Message Generator (Messaging Phase)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Pain-to-product mapping | ✅ Native (Claude) | None | Available |
| Email drafting (<150 words) | ✅ Native (Claude) | None | Available |
| LinkedIn message drafting (<75 words) | ✅ Native (Claude) | None | Available |
| Message variant generation | ✅ Native (Claude) | None | Available |
| Tone calibration | ✅ Native (Claude) | None | Available |

**Native Fallback:** Fully native capability.

---

### 2.4 Apollo Exporter (Packaging Phase - CSV)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Generate CSV from structured data | ✅ Native Python/Bash | None | Available |
| Apollo-compatible column format | ✅ Native | None | Available |
| BU-specific file splitting | ✅ Native | None | Available |
| CSV validation | ✅ Native | None | Available |

**Native Fallback:** Fully native capability. Use Python `csv` module or pandas.

```python
# Native approach - no skill needed
import csv
with open('targets.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[...])
    writer.writeheader()
    writer.writerows(targets)
```

---

### 2.5 Partner Brief Generator (Packaging Phase - PDF)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Generate one-page PDF brief | ❌ None | **`anthropics/skills@pdf`** | ✅ INSTALLED |
| Professional formatting | Via reportlab/pypdf | Skill provides workflow | ✅ INSTALLED |
| Template-based generation | ✅ Native | None | Available |

**Skill Already Available:** `document-skills:pdf` is installed and provides:
- PDF creation via reportlab
- PDF merging/splitting via pypdf
- Form filling capabilities
- Professional document generation

---

### 2.6 Channel Report Generator (Packaging Phase - Multi-Surface)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Slack-formatted markdown | ✅ Native | None | Available |
| One-page PDF scoreboard | ❌ None | **`anthropics/skills@pdf`** | ✅ INSTALLED |
| 2-3 slide PPTX deck | ❌ None | **`anthropics/skills@pptx`** | ✅ INSTALLED |
| Email draft | ✅ Native | None | Available |

**Skills Already Available:**
- `document-skills:pdf` for scoreboard PDF
- `document-skills:pptx` for slide deck with html2pptx workflow

---

### 2.7 Pipeline Syncer (Tracking Phase)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Google Sheets read/write | ❌ None | `andrejones92/canifi-life-os@google-sheets` | **TO INSTALL** |
| CSV export for Sheets import | ✅ Native | None | Available |
| Dashboard formulas | N/A (in Sheets) | Manual setup | N/A |

**Recommended Skill:** `andrejones92/canifi-life-os@google-sheets`

**Native Fallback:** Generate CSV files that user manually imports to Sheets.

---

### 2.8 Notification Layer (Delivery Phase)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Slack webhook posting | ❌ None | `vm0-ai/vm0-skills@slack-webhook` | **TO INSTALL** |
| Email composition | ✅ Native | None | Available |
| Email sending | ❌ None | `resend/resend-skills@send-email` | **OPTIONAL** |

**Recommended Skills:**
- `vm0-ai/vm0-skills@slack-webhook` for Slack notifications
- Native email drafts (user sends manually) OR `resend/resend-skills@send-email`

---

### 2.9 Spreadsheet Generation (Packaging Phase - XLSX)

| Need | Native Capability | Skill/Tool Required | Status |
|------|-------------------|---------------------|--------|
| Create Excel files | ❌ None | **`anthropics/skills@xlsx`** | ✅ INSTALLED |
| Formulas and formatting | Via openpyxl | Skill provides workflow | ✅ INSTALLED |
| Dashboard sheets | Via openpyxl | Skill provides workflow | ✅ INSTALLED |

**Skill Already Available:** `document-skills:xlsx` provides full Excel/CSV capabilities.

---

## Part 3: Skills + Tooling Map

### Critical Path Skills (Required for Core Workflow)

| Need | Recommended Skill | Install Command | Where It Plugs In | Config/Credentials | Fallback |
|------|-------------------|-----------------|-------------------|-------------------|----------|
| **PDF Generation** | `anthropics/skills@pdf` | Already installed | Partner Brief, Channel Scoreboard | None | N/A |
| **PPTX Generation** | `anthropics/skills@pptx` | Already installed | Channel Slides, Partner Decks | None | N/A |
| **XLSX Generation** | `anthropics/skills@xlsx` | Already installed | Pipeline exports, Reports | None | N/A |
| **CSV Export** | Native Python | N/A | Apollo CSV, Sheets import | None | N/A |

### Enhancement Skills (Improve Automation)

| Need | Recommended Skill | Install Command | Where It Plugs In | Config/Credentials | Fallback |
|------|-------------------|-----------------|-------------------|-------------------|----------|
| **Slack Notifications** | `vm0-ai/vm0-skills@slack-webhook` | `npx skills add vm0-ai/vm0-skills@slack-webhook -g -y` | Notification Layer | Slack webhook URL | Manual Slack posting |
| **Google Sheets API** | `andrejones92/canifi-life-os@google-sheets` | `npx skills add andrejones92/canifi-life-os@google-sheets -g -y` | Pipeline Syncer | Google API credentials | CSV import/export |
| **Email Sending** | `resend/resend-skills@send-email` | `npx skills add resend/resend-skills@send-email -g -y` | Notification Layer | Resend API key | Manual email sending |

### Optional Enhancement Skills (Nice-to-Have)

| Need | Recommended Skill | Install Command | Where It Plugs In | Config/Credentials | Fallback |
|------|-------------------|-----------------|-------------------|-------------------|----------|
| **Web Scraping** | `firecrawl/cli@firecrawl` | `npx skills add firecrawl/cli@firecrawl -g -y` | Signal Scanner | Firecrawl API key | WebFetch tool |
| **LinkedIn Data** | `andrejones92/canifi-life-os@linkedin` | `npx skills add andrejones92/canifi-life-os@linkedin -g -y` | Target Enrichment | LinkedIn API/cookies | Manual research |
| **HubSpot Sync** | `andrejones92/canifi-life-os@hubspot` | `npx skills add andrejones92/canifi-life-os@hubspot -g -y` | Future CRM integration | HubSpot API key | Google Sheets only |

---

## Part 4: Capability Matrix Summary

| Module | Native | Skill Required | Skill Status | Gap Level |
|--------|--------|----------------|--------------|-----------|
| Signal Scanner | Partial | Firecrawl (optional) | Not installed | LOW |
| Thesis Selector | ✅ Full | None | N/A | NONE |
| Target Builder | Partial | LinkedIn API (optional) | Not installed | MEDIUM |
| Message Generator | ✅ Full | None | N/A | NONE |
| Apollo Exporter | ✅ Full | None | N/A | NONE |
| BU Pack Generator | ✅ Full | None | N/A | NONE |
| Partner Brief | ❌ None | pdf | ✅ Installed | NONE |
| Pipeline Syncer | Partial | google-sheets | Not installed | MEDIUM |
| Channel Report | Partial | pdf, pptx | ✅ Installed | NONE |
| Notifications | ❌ None | slack-webhook | Not installed | MEDIUM |

---

## Part 5: Recommended Installation Priority

### Phase 1: Core Document Skills (Already Installed)
- ✅ `document-skills:pdf` — Partner briefs, scoreboards
- ✅ `document-skills:pptx` — Channel slides, partner decks
- ✅ `document-skills:xlsx` — Excel exports, dashboards

### Phase 2: Notification & Delivery (Install Now)
```bash
# Slack webhook for push notifications
npx skills add vm0-ai/vm0-skills@slack-webhook -g -y
```

### Phase 3: Google Sheets Integration (Install for Pipeline)
```bash
# Google Sheets API for pipeline management
npx skills add andrejones92/canifi-life-os@google-sheets -g -y
```

### Phase 4: Optional Enhancements (Future)
```bash
# Web scraping for signal scanning
npx skills add firecrawl/cli@firecrawl -g -y

# Email sending (if automating delivery)
npx skills add resend/resend-skills@send-email -g -y

# LinkedIn data (for target enrichment)
npx skills add andrejones92/canifi-life-os@linkedin -g -y
```

---

## Part 6: Credentials & Configuration Required

### Immediate Requirements (Phase 2-3)

| Skill | Credential Needed | How to Obtain |
|-------|-------------------|---------------|
| slack-webhook | Slack Incoming Webhook URL | Slack Admin > Apps > Incoming Webhooks |
| google-sheets | Google Cloud Service Account JSON | Google Cloud Console > APIs > Sheets API |

### Future Requirements (Phase 4)

| Skill | Credential Needed | How to Obtain |
|-------|-------------------|---------------|
| firecrawl | Firecrawl API Key | firecrawl.dev |
| send-email | Resend API Key | resend.com |
| linkedin | LinkedIn cookies/API | Manual extraction |

---

## Part 7: Architecture Integration Points

### Where Skills Plug Into v3 Modules

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GROWTH OS v3 MODULE FLOW                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Signal Scanner ──────────────────┐                                  │
│       │                           │                                  │
│       │ [firecrawl - optional]    │                                  │
│       ▼                           │                                  │
│  Thesis Selector                  │                                  │
│       │                           │                                  │
│       │ [native]                  │                                  │
│       ▼                           │                                  │
│  Target Builder ──────────────────┼─── [linkedin - optional]         │
│       │                           │                                  │
│       │ [native]                  │                                  │
│       ▼                           │                                  │
│  Message Generator                │                                  │
│       │                           │                                  │
│       │ [native]                  │                                  │
│       ▼                           │                                  │
│  Apollo Exporter ─────────────────┼─── [native CSV]                  │
│       │                           │                                  │
│       ▼                           │                                  │
│  BU Pack Generator ───────────────┼─── [native]                      │
│       │                           │                                  │
│       ├─────────────────────────────── [slack-webhook] ──► Slack     │
│       │                           │                                  │
│       ▼                           │                                  │
│  Partner Brief ───────────────────┼─── [pdf skill] ──► PDF           │
│       │                           │                                  │
│       ▼                           │                                  │
│  Pipeline Syncer ─────────────────┼─── [google-sheets] ──► Sheets    │
│       │                           │                                  │
│       ▼                           │                                  │
│  Channel Report ──────────────────┼─── [pdf skill] ──► PDF           │
│       │                           │    [pptx skill] ──► PPTX         │
│       │                           │    [native] ──► Slack MD         │
│       │                           │                                  │
│       ▼                           │                                  │
│  Notification Layer ──────────────┴─── [slack-webhook] ──► Slack     │
│                                        [send-email] ──► Email        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary

### What's Ready Now
1. **PDF generation** — Partner briefs, scoreboards (skill installed)
2. **PPTX generation** — Channel slides, partner decks (skill installed)
3. **XLSX generation** — Pipeline exports (skill installed)
4. **CSV generation** — Apollo exports (native)
5. **Message generation** — All messaging (native)
6. **Research & synthesis** — All intelligence work (native)

### What Needs Installation (Recommended)
1. **Slack webhook** — Push notifications
2. **Google Sheets** — Pipeline source of truth

### What's Optional (Future Enhancement)
1. **Firecrawl** — Automated signal scanning
2. **LinkedIn** — Target enrichment
3. **Resend** — Automated email delivery

### Gaps That Remain Manual
1. **Twitter/X scanning** — No reliable API skill available
2. **LinkedIn profile lookup** — Requires API access or manual research
3. **Email discovery** — Requires Hunter.io/Apollo API or manual research
