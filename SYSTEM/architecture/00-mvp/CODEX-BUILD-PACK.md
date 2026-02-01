# Codex Build Pack — MVP

> **Objective:** Build one working Producer → Evaluator → Reviser loop for Target Builder.
> **Outcome:** A reusable loop engine that can be extended to other agents without code changes.

Execute these tasks in order. Each task is self-contained with clear acceptance criteria.

---

## Task 1: Create agent_runs Table

### Objective
Add the `agent_runs` table to the existing Drizzle schema for logging all agent executions.

### Files to Modify
- `dashboard/server/db/schema.ts`

### Code Requirements

Add this table definition after the existing tables:

```typescript
import { sql } from 'drizzle-orm';

export const agentRuns = sqliteTable('agent_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Identity
  cycleId: text('cycle_id').notNull(),
  agentName: text('agent_name').notNull(),
  attempt: integer('attempt').notNull().default(1),

  // Status: 'running' | 'passed' | 'failed' | 'escalated'
  status: text('status').notNull(),

  // Scoring
  overallScore: real('overall_score'),
  dimensionScores: text('dimension_scores'), // JSON string

  // Feedback
  feedback: text('feedback'),
  suggestedFixes: text('suggested_fixes'), // JSON array string

  // Artifacts
  artifactPath: text('artifact_path'),

  // Metadata
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  durationMs: integer('duration_ms'),
  rubricVersion: text('rubric_version'),
});
```

### Acceptance Criteria
```bash
# Verify table compiles
cd dashboard && npx tsc --noEmit

# Verify table can be created
npx drizzle-kit push:sqlite

# Verify table exists
sqlite3 local.db ".schema agent_runs"
```

Expected output: Table schema with all columns.

---

## Task 2: Create Agent Configuration File

### Objective
Create the agent registry that allows adding new agents via config only.

### Files to Create
- `SYSTEM/config/agents.yaml`

### Code Requirements

```yaml
# SYSTEM/config/agents.yaml
# Agent configuration registry
# Adding a new agent = adding an entry here + creating rubric/prompts

version: "1.0.0"

defaults:
  pass_threshold: 0.85
  max_attempts: 3
  escalate_on_fail: true

agents:
  target_builder:
    name: "Target Builder"
    description: "Generate trigger-qualified target list from thesis inputs"
    rubric: "rubrics/target-quality.yaml"
    producer: "prompts/producers/target-builder.md"
    evaluator: "prompts/evaluators/target-builder-evaluator.md"
    reviser: "prompts/revisers/target-builder-reviser.md"
    threshold: 0.85
    max_attempts: 3
    escalate_on_fail: true
    inputs:
      - thesis
      - trigger_library
      - target_history
      - active_pipeline
    outputs:
      - target_list_md
      - dedup_additions
```

### Acceptance Criteria
```bash
# Verify YAML is valid
python3 -c "import yaml; yaml.safe_load(open('SYSTEM/config/agents.yaml'))"
```

Expected: No errors.

---

## Task 3: Create Target Quality Rubric

### Objective
Define the scoring rubric for evaluating target list quality.

### Files to Create
- `SYSTEM/rubrics/target-quality.yaml`

### Code Requirements

```yaml
# SYSTEM/rubrics/target-quality.yaml
# Scoring rubric for Target Builder output

metadata:
  name: "Target Quality Rubric"
  version: "1.0.0"
  agent: "target_builder"
  updated: "2026-01-31"

threshold: 0.85

dimensions:
  trigger_validity:
    weight: 0.30
    description: "Target has valid trigger from Trigger Library"
    scoring:
      1.0: "Exact trigger library match with source URL provided"
      0.7: "Trigger type matches library but source is weak or missing"
      0.4: "Trigger is inferred, not explicitly stated"
      0.0: "No trigger identified or trigger type not in library"

  trigger_recency:
    weight: 0.20
    description: "Trigger is within acceptable age window"
    scoring:
      1.0: "Trigger occurred < 14 days ago"
      0.8: "Trigger occurred 14-30 days ago"
      0.5: "Trigger occurred 30-60 days ago (funding/treasury only)"
      0.0: "Trigger is older than maximum allowed window"

  buyer_identified:
    weight: 0.20
    description: "Decision-maker identified with contact information"
    scoring:
      1.0: "Full name + job title + LinkedIn URL provided"
      0.8: "Full name + job title provided"
      0.5: "Job title only (no specific name)"
      0.0: "No buyer information provided"

  bu_fit:
    weight: 0.15
    description: "Clear Business Unit assignment"
    scoring:
      1.0: "Clear primary BU (Bitwage, TeamPay, or Mining)"
      0.7: "Dual BU fit identified with primary recommendation"
      0.3: "Ambiguous BU fit, requires clarification"
      0.0: "No clear BU fit for any product line"

  dedup_check:
    weight: 0.15
    description: "Target not recently contacted"
    scoring:
      1.0: "Company not found in target-history.md"
      0.5: "Company in history but last contact > 90 days ago"
      0.0: "Company contacted within past 90 days"

# Weights must sum to 1.0
# Verify: 0.30 + 0.20 + 0.20 + 0.15 + 0.15 = 1.00
```

### Acceptance Criteria
```bash
# Verify YAML is valid
python3 -c "import yaml; yaml.safe_load(open('SYSTEM/rubrics/target-quality.yaml'))"

# Verify weights sum to 1.0
python3 -c "
import yaml
r = yaml.safe_load(open('SYSTEM/rubrics/target-quality.yaml'))
total = sum(d['weight'] for d in r['dimensions'].values())
assert abs(total - 1.0) < 0.001, f'Weights sum to {total}, expected 1.0'
print('Weights valid: sum =', total)
"
```

---

## Task 4: Create Producer Prompt

### Objective
Create the prompt template for the Target Builder producer agent.

### Files to Create
- `SYSTEM/prompts/producers/target-builder.md`

### Code Requirements

```markdown
# Target Builder — Producer Prompt

## Role
You are the Target Builder agent. Your job is to research and produce a trigger-qualified target list for outbound sales.

## Inputs

- **thesis**: The selected targeting thesis (segment, triggers, buyer persona)
- **trigger_library**: Valid triggers with age windows (from config/triggers.yaml)
- **target_history**: Previously contacted companies (from KNOWLEDGE/target-history.md)
- **active_pipeline**: Currently active targets (from KNOWLEDGE/target-pipeline.md)

## Output Format

Produce a markdown file with this exact structure:

```markdown
# Target List: {thesis_name}

**Generated:** {timestamp}
**Thesis:** {thesis_description}
**Target Count:** {count}

## Targets

| Company | BU Fit | Trigger | Trigger Date | Trigger Source | Buyer Name | Buyer Title | LinkedIn | Notes |
|---------|--------|---------|--------------|----------------|------------|-------------|----------|-------|
| Acme Corp | Bitwage | Series A Funding | 2026-01-25 | TechCrunch | Jane Doe | Head of People | linkedin.com/in/janedoe | 150 employees, LATAM expansion |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

## Skipped Companies

| Company | Reason |
|---------|--------|
| Beta Inc | Already in active pipeline |
| Gamma LLC | Contacted 45 days ago |

## Summary

- Total researched: {n}
- Qualified: {n}
- Skipped: {n}
- Primary BU distribution: Bitwage: {n}, TeamPay: {n}, Mining: {n}
```

## Instructions

1. **Ingest** the thesis parameters and understand the target profile
2. **Research** potential targets matching the thesis criteria
3. **Validate** each target against these rules:
   - Has valid trigger from trigger_library
   - Trigger is within age window (default <30 days, funding <60 days)
   - Buyer is identifiable (name + title preferred, title minimum)
   - Clear BU fit
   - Not in target-history.md within 90 days
   - Not in active-pipeline.md
4. **Rank** by trigger strength if more than 15 targets qualify
5. **Limit** to 10-15 targets per list
6. **Document** skipped companies with reasons

## Constraints

- NEVER include companies without a valid trigger
- NEVER include companies contacted in past 90 days
- NEVER include companies already in active pipeline
- ALWAYS provide trigger source URL when available
- ALWAYS attempt to find buyer name, not just title
- Target count MUST be between 5 and 15

## Example

See: SYSTEM/examples/gold-targets/ for high-quality examples.
```

### Acceptance Criteria
```bash
# Verify file exists and has required sections
grep -c "## Role" SYSTEM/prompts/producers/target-builder.md
grep -c "## Inputs" SYSTEM/prompts/producers/target-builder.md
grep -c "## Output Format" SYSTEM/prompts/producers/target-builder.md
grep -c "## Instructions" SYSTEM/prompts/producers/target-builder.md
grep -c "## Constraints" SYSTEM/prompts/producers/target-builder.md
```

Expected: Each grep returns 1.

---

## Task 5: Create Evaluator Prompt

### Objective
Create the prompt template for the Target Builder evaluator agent.

### Files to Create
- `SYSTEM/prompts/evaluators/target-builder-evaluator.md`

### Code Requirements

```markdown
# Target Builder Evaluator — Evaluator Prompt

## Role
You are the Target Quality Evaluator. Your job is to score a target list against the quality rubric and provide actionable feedback.

## Inputs

- **target_list**: The markdown output from Target Builder
- **rubric**: The scoring rubric (SYSTEM/rubrics/target-quality.yaml)
- **trigger_library**: Valid triggers with age windows
- **target_history**: Previously contacted companies

## Output Format

You MUST return a JSON object with this exact structure:

```json
{
  "overallScore": 0.85,
  "passed": true,
  "dimensionScores": {
    "trigger_validity": {
      "score": 0.9,
      "weight": 0.30,
      "reason": "9/10 targets have valid triggers from library with sources"
    },
    "trigger_recency": {
      "score": 0.8,
      "weight": 0.20,
      "reason": "8/10 triggers within 14 days, 2 are 20 days old"
    },
    "buyer_identified": {
      "score": 0.7,
      "weight": 0.20,
      "reason": "7/10 have name+title, 3 have title only"
    },
    "bu_fit": {
      "score": 1.0,
      "weight": 0.15,
      "reason": "All targets have clear BU assignment"
    },
    "dedup_check": {
      "score": 0.85,
      "weight": 0.15,
      "reason": "1 target in history but > 90 days ago"
    }
  },
  "feedback": "Target list quality is good. Minor issues with buyer identification for 3 targets.",
  "suggestedFixes": [
    "Research buyer names for: Epsilon Inc, Zeta Corp, Theta LLC",
    "Consider refreshing trigger source for Beta Inc (20 days old)"
  ],
  "metadata": {
    "rubricVersion": "1.0.0",
    "evaluatedAt": "2026-01-31T10:30:00Z",
    "itemsEvaluated": 10
  }
}
```

## Instructions

1. **Parse** the target list markdown into structured data
2. **Evaluate** each target against each rubric dimension
3. **Calculate** dimension scores as average across all targets
4. **Calculate** overall score as weighted average of dimension scores
5. **Determine** pass/fail based on threshold (0.85)
6. **Generate** specific, actionable feedback for reviser
7. **Return** structured JSON only — no markdown wrapper

## Scoring Rules

For each dimension, evaluate every target:
- Count how many targets score 1.0, 0.8, 0.5, 0.0, etc.
- Dimension score = weighted average across targets
- Overall score = sum(dimension_score * dimension_weight)

## Constraints

- Output MUST be valid JSON, parseable by JSON.parse()
- ALL dimension names must match rubric exactly
- Weights must match rubric exactly
- suggestedFixes must be specific and actionable
- NEVER pass a list with overallScore < threshold

## Example Failing Output

```json
{
  "overallScore": 0.68,
  "passed": false,
  "dimensionScores": {
    "trigger_validity": {
      "score": 0.6,
      "weight": 0.30,
      "reason": "4/10 targets missing trigger source, 2 have invalid trigger types"
    },
    ...
  },
  "feedback": "Target list below quality threshold. Major issues with trigger documentation.",
  "suggestedFixes": [
    "Add trigger source URLs for: Acme, Beta, Gamma, Delta",
    "Replace invalid triggers for: Epsilon (trigger type 'general interest' not in library), Zeta (trigger type 'news mention' not in library)",
    "Remove or replace: Theta (no trigger identified)"
  ],
  ...
}
```
```

### Acceptance Criteria
```bash
# Verify file exists and has required sections
grep -c "## Role" SYSTEM/prompts/evaluators/target-builder-evaluator.md
grep -c "## Output Format" SYSTEM/prompts/evaluators/target-builder-evaluator.md
grep -c "overallScore" SYSTEM/prompts/evaluators/target-builder-evaluator.md
grep -c "dimensionScores" SYSTEM/prompts/evaluators/target-builder-evaluator.md
grep -c "suggestedFixes" SYSTEM/prompts/evaluators/target-builder-evaluator.md
```

Expected: Each grep returns >= 1.

---

## Task 6: Create Reviser Prompt

### Objective
Create the prompt template for the Target Builder reviser agent.

### Files to Create
- `SYSTEM/prompts/revisers/target-builder-reviser.md`

### Code Requirements

```markdown
# Target Builder Reviser — Reviser Prompt

## Role
You are the Target List Reviser. Your job is to fix issues identified by the evaluator and produce an improved target list.

## Inputs

- **original_output**: The target list markdown that failed evaluation
- **evaluation**: The evaluator's JSON output with scores and feedback
- **thesis**: The original thesis (for context)
- **trigger_library**: Valid triggers with age windows
- **target_history**: Previously contacted companies

## Output Format

Produce a revised markdown file in the same format as the original, with issues fixed.

## Instructions

1. **Parse** the evaluator's suggestedFixes array
2. **Address** each fix systematically:
   - Missing trigger sources → Research and add source URLs
   - Invalid triggers → Replace with valid trigger from library or remove target
   - Missing buyer names → Research LinkedIn, company pages, press releases
   - Dedup violations → Remove target from list
   - Stale triggers → Update with more recent trigger or remove
3. **Preserve** targets that scored well (don't break what works)
4. **Update** the summary section with revised counts
5. **Add** revision note at top of file:

```markdown
# Target List: {thesis_name}

> **Revision:** Attempt {n} — Fixed {count} issues from evaluator feedback

**Generated:** {original_timestamp}
**Revised:** {revision_timestamp}
...
```

## Constraints

- ONLY fix issues identified in suggestedFixes
- NEVER remove targets that passed all checks
- NEVER add new targets (only fix existing ones)
- If a target cannot be fixed, remove it and note in Skipped Companies
- Maintain minimum 5 targets — if fixing drops below 5, flag for escalation

## Example Fix Flow

Evaluator feedback:
```json
{
  "suggestedFixes": [
    "Add trigger source URLs for: Acme Corp, Beta Inc",
    "Research buyer names for: Gamma LLC",
    "Remove duplicate: Delta Co (contacted 45 days ago)"
  ]
}
```

Reviser actions:
1. Research TechCrunch, Crunchbase for Acme Corp funding announcement → add URL
2. Research LinkedIn for Beta Inc hiring post → add URL
3. Search LinkedIn for Gamma LLC Head of Finance → found "John Smith" → add name
4. Remove Delta Co from target table → add to Skipped Companies with reason

## Anti-Patterns (Do NOT)

- Don't invent trigger sources — if you can't find it, note "Source not found" and remove target
- Don't guess buyer names — if you can't verify, leave as title only
- Don't add unrelated targets to hit count minimums
- Don't ignore low-scoring dimensions
```

### Acceptance Criteria
```bash
# Verify file exists and has required sections
grep -c "## Role" SYSTEM/prompts/revisers/target-builder-reviser.md
grep -c "## Instructions" SYSTEM/prompts/revisers/target-builder-reviser.md
grep -c "suggestedFixes" SYSTEM/prompts/revisers/target-builder-reviser.md
```

Expected: Each grep returns >= 1.

---

## Task 7: Create Loop Engine

### Objective
Create the generic loop engine that runs Producer → Evaluator → Reviser cycles.

### Files to Create
- `SYSTEM/orchestrator/loop-engine.ts`

### Code Requirements

```typescript
// SYSTEM/orchestrator/loop-engine.ts
// Generic loop engine for Producer → Evaluator → Reviser cycles

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// ============================================================
// TYPES
// ============================================================

export interface RunRecord {
  cycle_id: string;
  agent_name: string;
  attempt: number;
  status: 'running' | 'passed' | 'failed' | 'escalated';
  overall_score: number | null;
  dimension_scores: Record<string, number> | null;
  feedback: string | null;
  suggested_fixes: string[] | null;
  artifact_path: string | null;
  created_at: string;
  duration_ms: number | null;
  rubric_version: string | null;
}

export interface EvaluatorOutput {
  overallScore: number;
  passed: boolean;
  dimensionScores: Record<string, {
    score: number;
    weight: number;
    reason: string;
  }>;
  feedback: string;
  suggestedFixes: string[];
  metadata?: {
    rubricVersion: string;
    evaluatedAt: string;
    itemsEvaluated: number;
  };
}

export interface LoopConfig {
  cycleId: string;
  agentName: string;
  producerPrompt: string;
  evaluatorPrompt: string;
  reviserPrompt: string;
  rubricPath: string;
  producerInputs: Record<string, unknown>;
  passThreshold?: number;
  maxAttempts?: number;
  outputDir: string;
}

export interface LoopResult {
  success: boolean;
  finalAttempt: number;
  finalScore: number | null;
  artifactPath: string | null;
  allRuns: RunRecord[];
  escalated: boolean;
  escalationReason?: string;
}

// ============================================================
// LOOP ENGINE CLASS
// ============================================================

export class LoopEngine {
  private config: Required<LoopConfig>;
  private runs: RunRecord[] = [];
  private rubric: any;

  constructor(config: LoopConfig) {
    this.config = {
      passThreshold: 0.85,
      maxAttempts: 3,
      ...config,
    };

    // Load rubric
    this.rubric = yaml.load(
      fs.readFileSync(path.join(process.cwd(), 'SYSTEM', config.rubricPath), 'utf-8')
    );
  }

  /**
   * Run the complete produce → evaluate → revise loop
   */
  async runLoop(): Promise<LoopResult> {
    let attempt = 1;
    let lastOutput: string | null = null;
    let lastEvaluation: EvaluatorOutput | null = null;

    // Ensure output directory exists
    const agentOutputDir = path.join(
      this.config.outputDir,
      this.config.cycleId,
      this.config.agentName
    );
    fs.mkdirSync(agentOutputDir, { recursive: true });

    while (attempt <= this.config.maxAttempts) {
      const runRecord = this.createRunRecord(attempt);

      try {
        // Step 1: Produce (or Revise)
        const startTime = Date.now();
        let output: string;

        if (attempt === 1) {
          output = await this.runProducer(this.config.producerInputs);
        } else {
          output = await this.runReviser(lastOutput!, lastEvaluation!);
        }

        // Save output artifact
        const artifactPath = path.join(agentOutputDir, `attempt-${attempt}.md`);
        fs.writeFileSync(artifactPath, output);
        runRecord.artifact_path = artifactPath;

        // Step 2: Evaluate
        const evaluation = await this.runEvaluator(output);
        const evalPath = path.join(agentOutputDir, `attempt-${attempt}.eval.json`);
        fs.writeFileSync(evalPath, JSON.stringify(evaluation, null, 2));

        // Update run record
        runRecord.overall_score = evaluation.overallScore;
        runRecord.dimension_scores = Object.fromEntries(
          Object.entries(evaluation.dimensionScores).map(([k, v]) => [k, v.score])
        );
        runRecord.feedback = evaluation.feedback;
        runRecord.suggested_fixes = evaluation.suggestedFixes;
        runRecord.duration_ms = Date.now() - startTime;
        runRecord.rubric_version = this.rubric.metadata?.version || '1.0.0';

        // Step 3: Check if passed
        if (evaluation.passed && evaluation.overallScore >= this.config.passThreshold) {
          runRecord.status = 'passed';
          this.runs.push(runRecord);
          await this.logRun(runRecord);

          // Create final symlink/copy
          const finalPath = path.join(agentOutputDir, 'final.md');
          fs.copyFileSync(artifactPath, finalPath);

          return {
            success: true,
            finalAttempt: attempt,
            finalScore: evaluation.overallScore,
            artifactPath: finalPath,
            allRuns: this.runs,
            escalated: false,
          };
        }

        // Failed this attempt
        runRecord.status = 'failed';
        this.runs.push(runRecord);
        await this.logRun(runRecord);

        lastOutput = output;
        lastEvaluation = evaluation;
        attempt++;

      } catch (error) {
        runRecord.status = 'failed';
        runRecord.feedback = error instanceof Error ? error.message : 'Unknown error';
        this.runs.push(runRecord);
        await this.logRun(runRecord);
        attempt++;
      }
    }

    // Exhausted all attempts — escalate
    const escalationRecord = this.createRunRecord(attempt - 1);
    escalationRecord.status = 'escalated';
    escalationRecord.feedback = `Failed to reach threshold (${this.config.passThreshold}) after ${this.config.maxAttempts} attempts. Last score: ${lastEvaluation?.overallScore || 'N/A'}`;

    return {
      success: false,
      finalAttempt: attempt - 1,
      finalScore: lastEvaluation?.overallScore || null,
      artifactPath: null,
      allRuns: this.runs,
      escalated: true,
      escalationReason: escalationRecord.feedback,
    };
  }

  /**
   * Create a new run record
   */
  private createRunRecord(attempt: number): RunRecord {
    return {
      cycle_id: this.config.cycleId,
      agent_name: this.config.agentName,
      attempt,
      status: 'running',
      overall_score: null,
      dimension_scores: null,
      feedback: null,
      suggested_fixes: null,
      artifact_path: null,
      created_at: new Date().toISOString(),
      duration_ms: null,
      rubric_version: null,
    };
  }

  /**
   * Run the producer agent
   * PLACEHOLDER: Replace with actual LLM call
   */
  private async runProducer(inputs: Record<string, unknown>): Promise<string> {
    // TODO: Implement actual LLM call using producer prompt
    // For now, this is a placeholder that should be replaced
    // with your preferred LLM integration (OpenAI, Anthropic, etc.)

    const promptPath = path.join(process.cwd(), 'SYSTEM', this.config.producerPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');

    // Placeholder implementation - replace with actual LLM call
    console.log(`[LoopEngine] Running producer for ${this.config.agentName}`);
    console.log(`[LoopEngine] Inputs:`, JSON.stringify(inputs, null, 2));

    throw new Error(
      'Producer LLM integration not implemented. ' +
      'Replace this method with your LLM API call.'
    );
  }

  /**
   * Run the evaluator agent
   * PLACEHOLDER: Replace with actual LLM call
   */
  private async runEvaluator(output: string): Promise<EvaluatorOutput> {
    // TODO: Implement actual LLM call using evaluator prompt
    // The evaluator MUST return valid JSON matching EvaluatorOutput

    const promptPath = path.join(process.cwd(), 'SYSTEM', this.config.evaluatorPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');

    console.log(`[LoopEngine] Running evaluator for ${this.config.agentName}`);

    throw new Error(
      'Evaluator LLM integration not implemented. ' +
      'Replace this method with your LLM API call.'
    );
  }

  /**
   * Run the reviser agent
   * PLACEHOLDER: Replace with actual LLM call
   */
  private async runReviser(
    originalOutput: string,
    evaluation: EvaluatorOutput
  ): Promise<string> {
    // TODO: Implement actual LLM call using reviser prompt

    const promptPath = path.join(process.cwd(), 'SYSTEM', this.config.reviserPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');

    console.log(`[LoopEngine] Running reviser for ${this.config.agentName}`);
    console.log(`[LoopEngine] Fixes to apply:`, evaluation.suggestedFixes);

    throw new Error(
      'Reviser LLM integration not implemented. ' +
      'Replace this method with your LLM API call.'
    );
  }

  /**
   * Log run to SQLite database
   */
  private async logRun(run: RunRecord): Promise<void> {
    // TODO: Implement database logging
    // Use the drizzle schema from dashboard/server/db/schema.ts

    console.log(`[LoopEngine] Logging run:`, {
      cycle_id: run.cycle_id,
      agent_name: run.agent_name,
      attempt: run.attempt,
      status: run.status,
      score: run.overall_score,
    });

    // Placeholder - write to JSON file for now
    const logPath = path.join(
      this.config.outputDir,
      this.config.cycleId,
      'run-log.json'
    );

    let logs: RunRecord[] = [];
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    }
    logs.push(run);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

/**
 * Create a loop engine from agent config
 */
export function createLoopEngine(
  cycleId: string,
  agentName: string,
  producerInputs: Record<string, unknown>,
  outputDir: string = 'WORK/runs'
): LoopEngine {
  // Load agent config
  const configPath = path.join(process.cwd(), 'SYSTEM/config/agents.yaml');
  const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) as any;

  const agentConfig = config.agents[agentName];
  if (!agentConfig) {
    throw new Error(`Agent "${agentName}" not found in config`);
  }

  return new LoopEngine({
    cycleId,
    agentName,
    producerPrompt: agentConfig.producer,
    evaluatorPrompt: agentConfig.evaluator,
    reviserPrompt: agentConfig.reviser,
    rubricPath: agentConfig.rubric,
    producerInputs,
    passThreshold: agentConfig.threshold || config.defaults.pass_threshold,
    maxAttempts: agentConfig.max_attempts || config.defaults.max_attempts,
    outputDir,
  });
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx ts-node loop-engine.ts <cycle-id> <agent-name>');
    console.log('Example: npx ts-node loop-engine.ts 2026-01-31-001 target_builder');
    process.exit(1);
  }

  const [cycleId, agentName] = args;

  // Example inputs for target_builder
  const inputs = {
    thesis: 'LATAM Fintech Series A Recipients',
    trigger_library: 'config/triggers.yaml',
    target_history: 'KNOWLEDGE/target-history.md',
    active_pipeline: 'KNOWLEDGE/target-pipeline.md',
  };

  const engine = createLoopEngine(cycleId, agentName, inputs);

  engine.runLoop()
    .then((result) => {
      console.log('\n=== Loop Complete ===');
      console.log('Success:', result.success);
      console.log('Final Attempt:', result.finalAttempt);
      console.log('Final Score:', result.finalScore);
      console.log('Artifact Path:', result.artifactPath);
      console.log('Escalated:', result.escalated);
      if (result.escalationReason) {
        console.log('Escalation Reason:', result.escalationReason);
      }
    })
    .catch((error) => {
      console.error('Loop failed:', error);
      process.exit(1);
    });
}
```

### Acceptance Criteria
```bash
# Verify TypeScript compiles
cd SYSTEM/orchestrator && npx tsc --noEmit loop-engine.ts

# Verify exports are correct
grep -c "export class LoopEngine" SYSTEM/orchestrator/loop-engine.ts
grep -c "export function createLoopEngine" SYSTEM/orchestrator/loop-engine.ts
grep -c "export interface RunRecord" SYSTEM/orchestrator/loop-engine.ts
grep -c "export interface EvaluatorOutput" SYSTEM/orchestrator/loop-engine.ts
```

Expected: Each grep returns 1.

---

## Task 8: Create Directory Structure

### Objective
Create all required directories for MVP.

### Commands to Run

```bash
# Create directory structure
mkdir -p SYSTEM/config
mkdir -p SYSTEM/rubrics
mkdir -p SYSTEM/prompts/producers
mkdir -p SYSTEM/prompts/evaluators
mkdir -p SYSTEM/prompts/revisers
mkdir -p SYSTEM/orchestrator
mkdir -p SYSTEM/examples/gold-targets
mkdir -p SYSTEM/examples/anti-patterns
mkdir -p WORK/runs
```

### Acceptance Criteria
```bash
# Verify all directories exist
ls -la SYSTEM/config
ls -la SYSTEM/rubrics
ls -la SYSTEM/prompts/producers
ls -la SYSTEM/prompts/evaluators
ls -la SYSTEM/prompts/revisers
ls -la SYSTEM/orchestrator
ls -la SYSTEM/examples/gold-targets
ls -la WORK/runs
```

Expected: All directories exist.

---

## Task 9: Add npm Scripts

### Objective
Add convenience scripts for running the loop engine.

### Files to Modify
- `package.json` (root or dashboard)

### Code Requirements

Add to scripts section:

```json
{
  "scripts": {
    "loop:run": "ts-node SYSTEM/orchestrator/loop-engine.ts",
    "loop:test": "ts-node SYSTEM/orchestrator/loop-engine.ts test-cycle target_builder",
    "db:migrate": "cd dashboard && npx drizzle-kit push:sqlite"
  }
}
```

### Acceptance Criteria
```bash
# Verify scripts are registered
npm run loop:run -- --help 2>&1 | head -5
```

Expected: Shows usage or runs.

---

## Task 10: Run End-to-End Verification

### Objective
Verify the complete MVP implementation.

### Verification Steps

```bash
# 1. Verify database table
sqlite3 dashboard/local.db ".schema agent_runs"

# 2. Verify config loads
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync('SYSTEM/config/agents.yaml'));
console.log('Agents configured:', Object.keys(config.agents));
"

# 3. Verify rubric loads
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const rubric = yaml.load(fs.readFileSync('SYSTEM/rubrics/target-quality.yaml'));
console.log('Rubric:', rubric.metadata.name);
console.log('Threshold:', rubric.threshold);
console.log('Dimensions:', Object.keys(rubric.dimensions));
"

# 4. Verify prompts exist
ls -la SYSTEM/prompts/producers/
ls -la SYSTEM/prompts/evaluators/
ls -la SYSTEM/prompts/revisers/

# 5. Verify loop engine compiles
cd SYSTEM/orchestrator && npx tsc --noEmit loop-engine.ts
```

### Final Checklist

| Item | Status |
|------|--------|
| `agent_runs` table created | ☐ |
| `agents.yaml` config file | ☐ |
| `target-quality.yaml` rubric | ☐ |
| `target-builder.md` producer prompt | ☐ |
| `target-builder-evaluator.md` evaluator prompt | ☐ |
| `target-builder-reviser.md` reviser prompt | ☐ |
| `loop-engine.ts` compiles | ☐ |
| All directories created | ☐ |
| npm scripts added | ☐ |

---

## Extensibility Verification

After MVP completion, verify that adding a second agent (e.g., `signal_scanner`) requires ONLY:

1. Create `SYSTEM/rubrics/signal-quality.yaml`
2. Create `SYSTEM/prompts/producers/signal-scanner.md`
3. Create `SYSTEM/prompts/evaluators/signal-scanner-evaluator.md`
4. Create `SYSTEM/prompts/revisers/signal-scanner-reviser.md`
5. Add entry to `SYSTEM/config/agents.yaml`:

```yaml
agents:
  target_builder:
    # ... existing config ...

  signal_scanner:  # NEW - just add this block
    name: "Signal Scanner"
    description: "Scan ecosystem sources for actionable signals"
    rubric: "rubrics/signal-quality.yaml"
    producer: "prompts/producers/signal-scanner.md"
    evaluator: "prompts/evaluators/signal-scanner-evaluator.md"
    reviser: "prompts/revisers/signal-scanner-reviser.md"
    threshold: 0.85
    max_attempts: 2
```

**NO changes to `loop-engine.ts` required.**

---

## Next Steps (Post-MVP)

After MVP is verified:

1. Implement LLM integration in loop-engine.ts (replace placeholder methods)
2. Implement database logging (replace JSON file logging)
3. Proceed to Medium stage (see `01-medium/README.md`)
