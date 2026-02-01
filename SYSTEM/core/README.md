# SYSTEM/core — Shared Primitives

> **Purpose:** Define shared conventions, schemas, and contracts used across all architecture stages.
> **Codex Note:** This folder establishes the "spine" that makes MVP → Medium → Hard stages interoperable.

---

## 1. Run Record Schema (Standard Contract)

Every agent attempt MUST produce a run record with these fields:

```typescript
interface RunRecord {
  // Identity
  cycle_id: string;        // e.g., "2026-01-31-001"
  agent_name: string;      // e.g., "target_builder"
  attempt: number;         // 1, 2, 3...

  // Status
  status: "running" | "passed" | "failed" | "escalated";

  // Scoring
  overall_score: number;   // 0.00 - 1.00
  dimension_scores: Record<string, number>; // {"trigger_validity": 0.9, ...}

  // Feedback
  feedback: string;        // Human-readable summary
  suggested_fixes: string[]; // Array of actionable items

  // Artifacts
  artifact_path: string;   // Path to output file

  // Metadata
  created_at: string;      // ISO 8601 timestamp
  duration_ms?: number;    // Execution time
  rubric_version?: string; // e.g., "1.0.0"
}
```

### SQLite Table (Minimal)

```sql
CREATE TABLE IF NOT EXISTS agent_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('running', 'passed', 'failed', 'escalated')),
  overall_score REAL,
  dimension_scores TEXT,  -- JSON string
  feedback TEXT,
  suggested_fixes TEXT,   -- JSON array string
  artifact_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  duration_ms INTEGER,
  rubric_version TEXT
);

CREATE INDEX idx_agent_runs_cycle ON agent_runs(cycle_id);
CREATE INDEX idx_agent_runs_agent ON agent_runs(agent_name);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
```

---

## 2. Evaluator Output Schema (Structured JSON)

Every evaluator MUST return this exact JSON structure:

```typescript
interface EvaluatorOutput {
  overallScore: number;      // 0.00 - 1.00
  passed: boolean;           // true if overallScore >= threshold
  dimensionScores: Record<string, {
    score: number;           // 0.00 - 1.00
    weight: number;          // 0.00 - 1.00 (must sum to 1.0)
    reason: string;          // Why this score
  }>;
  feedback: string;          // Summary for human review
  suggestedFixes: string[];  // Actionable items for reviser
  metadata?: {
    rubricVersion: string;
    evaluatedAt: string;
    itemsEvaluated: number;
  };
}
```

### Example Evaluator Output

```json
{
  "overallScore": 0.72,
  "passed": false,
  "dimensionScores": {
    "trigger_validity": {
      "score": 0.9,
      "weight": 0.30,
      "reason": "8/10 targets have valid triggers from library"
    },
    "trigger_recency": {
      "score": 0.6,
      "weight": 0.20,
      "reason": "4/10 targets have triggers older than 14 days"
    },
    "buyer_identified": {
      "score": 0.7,
      "weight": 0.20,
      "reason": "7/10 have name+title, 3 have title only"
    },
    "bu_fit": {
      "score": 0.8,
      "weight": 0.15,
      "reason": "All targets have clear BU assignment"
    },
    "dedup_check": {
      "score": 0.5,
      "weight": 0.15,
      "reason": "2 targets appear in history within 90 days"
    }
  },
  "feedback": "Target list quality below threshold. Main issues: stale triggers and dedup violations.",
  "suggestedFixes": [
    "Remove or update targets with triggers older than 14 days: Acme Corp, Beta Inc",
    "Remove duplicate targets: Gamma LLC (contacted 45 days ago), Delta Co (contacted 60 days ago)",
    "Research buyer names for: Epsilon, Zeta, Theta"
  ],
  "metadata": {
    "rubricVersion": "1.0.0",
    "evaluatedAt": "2026-01-31T10:30:00Z",
    "itemsEvaluated": 10
  }
}
```

---

## 3. Rubric Format Convention (YAML Schema)

All rubrics MUST follow this YAML structure:

```yaml
# SYSTEM/rubrics/{agent-name}-quality.yaml

metadata:
  name: "Target Quality Rubric"
  version: "1.0.0"
  agent: "target_builder"
  updated: "2026-01-31"

threshold: 0.85  # Overall score required to pass

dimensions:
  trigger_validity:
    weight: 0.30
    description: "Target has valid trigger from Trigger Library"
    scoring:
      1.0: "Exact trigger library match with source URL"
      0.7: "Trigger match but weak/missing source"
      0.0: "No trigger or invalid trigger type"

  trigger_recency:
    weight: 0.20
    description: "Trigger is within acceptable age window"
    scoring:
      1.0: "Trigger < 14 days old"
      0.8: "Trigger 14-30 days old"
      0.5: "Trigger 30-60 days old (funding/treasury only)"
      0.0: "Trigger outside all valid windows"

  buyer_identified:
    weight: 0.20
    description: "Decision-maker identified with contact info"
    scoring:
      1.0: "Full name + title + LinkedIn URL"
      0.8: "Full name + title"
      0.5: "Title only (no name)"
      0.0: "No buyer information"

  bu_fit:
    weight: 0.15
    description: "Clear Business Unit assignment"
    scoring:
      1.0: "Clear primary BU (Bitwage/TeamPay/Mining)"
      0.7: "Dual BU fit"
      0.0: "No clear BU fit"

  dedup_check:
    weight: 0.15
    description: "Target not recently contacted"
    scoring:
      1.0: "Not in target-history.md"
      0.5: "In history but > 90 days ago"
      0.0: "In history < 90 days ago"

# Weights MUST sum to 1.0
# Verify: 0.30 + 0.20 + 0.20 + 0.15 + 0.15 = 1.00
```

### Rubric Versioning Rules

1. **PATCH** (1.0.0 → 1.0.1): Wording changes, clarifications
2. **MINOR** (1.0.0 → 1.1.0): New scoring levels, weight adjustments < 0.05
3. **MAJOR** (1.0.0 → 2.0.0): New dimensions, weight changes > 0.05, threshold changes

---

## 4. Prompt Conventions

### File Naming

```
SYSTEM/prompts/
├── producers/
│   └── {agent-name}.md       # e.g., target-builder.md
├── evaluators/
│   └── {agent-name}-evaluator.md
└── revisers/
    └── {agent-name}-reviser.md
```

### Prompt Structure (Required Sections)

Every prompt file MUST contain these sections:

```markdown
# {Agent Name} Prompt

## Role
One-sentence description of what this agent does.

## Inputs
- **input_name**: Description and expected format
- **rubric**: Path to rubric file (evaluators only)

## Outputs
- **output_name**: Description and expected format
- Must include structured JSON for evaluators

## Instructions
Step-by-step instructions for the agent.

## Examples
At least one input → output example.

## Constraints
- Hard rules that must never be violated
- Character limits, banned phrases, etc.
```

---

## 5. Artifact Storage Conventions

### Directory Structure

```
WORK/
├── runs/
│   └── {cycle-id}/
│       ├── {agent-name}/
│       │   ├── attempt-1.md      # First attempt output
│       │   ├── attempt-1.eval.json # Evaluator result
│       │   ├── attempt-2.md      # Revision output
│       │   ├── attempt-2.eval.json
│       │   └── final.md          # Symlink to passing attempt
│       └── run-log.json          # All runs for this cycle
```

### File Naming

- **Producer output**: `attempt-{n}.md`
- **Evaluator output**: `attempt-{n}.eval.json`
- **Final approved**: `final.md` (symlink or copy)
- **Run log**: `run-log.json` (array of RunRecord objects)

---

## 6. Loop Engine Contract

The loop engine MUST implement this interface:

```typescript
interface LoopEngine {
  /**
   * Run a complete produce → evaluate → revise loop
   */
  runLoop(config: LoopConfig): Promise<LoopResult>;
}

interface LoopConfig {
  cycleId: string;
  agentName: string;

  // Paths to prompt files
  producerPrompt: string;
  evaluatorPrompt: string;
  reviserPrompt: string;

  // Rubric path
  rubricPath: string;

  // Inputs for the producer
  producerInputs: Record<string, unknown>;

  // Thresholds
  passThreshold: number;  // Default 0.85
  maxAttempts: number;    // Default 3

  // Output directory
  outputDir: string;
}

interface LoopResult {
  success: boolean;
  finalAttempt: number;
  finalScore: number;
  artifactPath: string;
  allRuns: RunRecord[];
  escalated: boolean;
  escalationReason?: string;
}
```

### Adding a New Agent (Extensibility Requirement)

After MVP is complete, adding a second agent requires ONLY:

1. Create `SYSTEM/rubrics/{agent}-quality.yaml`
2. Create `SYSTEM/prompts/producers/{agent}.md`
3. Create `SYSTEM/prompts/evaluators/{agent}-evaluator.md`
4. Create `SYSTEM/prompts/revisers/{agent}-reviser.md`
5. Add config entry to `SYSTEM/config/agents.yaml`:

```yaml
agents:
  target_builder:
    rubric: "rubrics/target-quality.yaml"
    producer: "prompts/producers/target-builder.md"
    evaluator: "prompts/evaluators/target-builder-evaluator.md"
    reviser: "prompts/revisers/target-builder-reviser.md"
    threshold: 0.85
    max_attempts: 3

  # Adding a new agent - just add config:
  signal_scanner:
    rubric: "rubrics/signal-quality.yaml"
    producer: "prompts/producers/signal-scanner.md"
    evaluator: "prompts/evaluators/signal-scanner-evaluator.md"
    reviser: "prompts/revisers/signal-scanner-reviser.md"
    threshold: 0.85
    max_attempts: 2
```

**NO changes to the loop engine code required.**

---

## 7. Threshold Defaults

```yaml
# SYSTEM/config/thresholds.yaml

defaults:
  pass_threshold: 0.85
  max_attempts: 3
  escalate_on_fail: true

agents:
  target_builder:
    threshold: 0.85
    max_attempts: 3

  signal_scanner:
    threshold: 0.85
    max_attempts: 2

  thesis_selector:
    threshold: 0.80
    margin_required: 0.15  # Top thesis must beat #2 by this margin
    max_attempts: 2

  messaging_drafter:
    threshold: 0.85
    max_attempts: 3
    escalate_on_fail: false  # Messages can always be improved

  partner_agent:
    threshold: 0.85
    max_attempts: 2
    escalate_conditions:
      - exec_level_partner
      - requires_leadership_intro
```

---

## 8. Example Libraries Location

```
SYSTEM/examples/
├── gold-targets/           # High-scoring target lists
│   ├── 2026-01-latam-fintech.md
│   └── 2025-12-treasury-ops.md
├── gold-messages/          # High-scoring messages
│   ├── email-trigger-led.md
│   └── linkedin-warm-intro.md
├── anti-patterns/          # What NOT to do
│   ├── no-trigger-target.md
│   ├── generic-outreach.md
│   └── stale-signal.md
└── README.md               # Index and usage guide
```

---

## Quick Reference

| Artifact | Location | Format |
|----------|----------|--------|
| Run records | SQLite `agent_runs` table | SQL row |
| Run log (cycle) | `WORK/runs/{cycle-id}/run-log.json` | JSON array |
| Evaluator output | `WORK/runs/{cycle-id}/{agent}/attempt-{n}.eval.json` | JSON |
| Producer output | `WORK/runs/{cycle-id}/{agent}/attempt-{n}.md` | Markdown |
| Rubrics | `SYSTEM/rubrics/{agent}-quality.yaml` | YAML |
| Prompts | `SYSTEM/prompts/{type}/{agent}.md` | Markdown |
| Examples | `SYSTEM/examples/gold-{type}/` | Markdown |
| Agent config | `SYSTEM/config/agents.yaml` | YAML |
| Thresholds | `SYSTEM/config/thresholds.yaml` | YAML |
