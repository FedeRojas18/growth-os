// SYSTEM/orchestrator/loop-engine.ts
// Generic loop engine for Producer → Evaluator → Reviser cycles
//
// USAGE:
//   npx ts-node SYSTEM/orchestrator/loop-engine.ts <cycle-id> <agent-name>
//
// EXAMPLE:
//   npx ts-node SYSTEM/orchestrator/loop-engine.ts 2026-01-31-001 target_builder

import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

// ============================================================
// TYPES
// ============================================================

export interface RunRecord {
  cycle_id: string;
  agent_name: string;
  attempt: number;
  status: 'produced' | 'evaluated' | 'revised' | 'passed' | 'failed';
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
  dimensionScores: Record<string, number>;
  feedback: string;
  suggestedFixes: string[];
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

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface AgentConfig {
  name: string;
  description: string;
  rubric: string;
  producer: string;
  evaluator: string;
  reviser: string;
  threshold: number;
  max_attempts: number;
  escalate_on_fail: boolean;
}

interface ConfigFile {
  version: string;
  defaults: {
    pass_threshold: number;
    max_attempts: number;
    escalate_on_fail: boolean;
  };
  agents: Record<string, AgentConfig>;
}

interface RubricFile {
  metadata: {
    name: string;
    version: string;
    agent: string;
    updated: string;
  };
  threshold: number;
  dimensions: Record<string, {
    weight: number;
    description: string;
    scoring: Record<string, string>;
  }>;
}

// ============================================================
// PROJECT ROOT RESOLUTION
// ============================================================

function findProjectRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    if (fs.existsSync(path.join(current, 'SYSTEM'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

// ============================================================
// YAML PARSER (Simple implementation for portability)
// ============================================================

function parseYaml(content: string): any {
  // Simple YAML parser for our specific format
  // For production, use js-yaml package
  const lines = content.split('\n');
  const result: any = {};
  const stack: Array<{ indent: number; obj: any; key: string }> = [];
  let currentObj = result;
  let currentIndent = 0;

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (!match) continue;

    const [, spaces, key, value] = match;
    const indent = spaces.length;

    // Handle indentation changes
    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
      const popped = stack.pop()!;
      currentObj = popped.obj;
      currentIndent = popped.indent;
    }

    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    if (trimmedValue === '' || trimmedValue.startsWith('#')) {
      // Nested object
      currentObj[trimmedKey] = {};
      stack.push({ indent: currentIndent, obj: currentObj, key: trimmedKey });
      currentObj = currentObj[trimmedKey];
      currentIndent = indent;
    } else {
      // Value
      let parsedValue: any = trimmedValue;

      // Remove quotes
      if ((parsedValue.startsWith('"') && parsedValue.endsWith('"')) ||
          (parsedValue.startsWith("'") && parsedValue.endsWith("'"))) {
        parsedValue = parsedValue.slice(1, -1);
      }

      // Parse numbers
      if (!isNaN(Number(parsedValue)) && parsedValue !== '') {
        parsedValue = Number(parsedValue);
      }

      // Parse booleans
      if (parsedValue === 'true') parsedValue = true;
      if (parsedValue === 'false') parsedValue = false;

      currentObj[trimmedKey] = parsedValue;
    }
  }

  return result;
}

// ============================================================
// LOOP ENGINE CLASS
// ============================================================

export class LoopEngine {
  private config: Required<LoopConfig>;
  private runs: RunRecord[] = [];
  private rubric: RubricFile;
  private projectRoot: string;
  private openaiClient: any | null = null;
  private dbModulePromise: Promise<any> | null = null;

  constructor(config: LoopConfig) {
    this.projectRoot = findProjectRoot(process.cwd());
    this.config = {
      passThreshold: 0.85,
      maxAttempts: 3,
      ...config,
    };

    // Load rubric
    const rubricPath = path.join(this.projectRoot, 'SYSTEM', config.rubricPath);
    const rubricContent = fs.readFileSync(rubricPath, 'utf-8');
    this.rubric = parseYaml(rubricContent) as RubricFile;
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
      this.projectRoot,
      this.config.outputDir,
      this.config.cycleId,
      this.config.agentName
    );
    fs.mkdirSync(agentOutputDir, { recursive: true });

    console.log(`\n[LoopEngine] Starting loop for ${this.config.agentName}`);
    console.log(`[LoopEngine] Cycle ID: ${this.config.cycleId}`);
    console.log(`[LoopEngine] Threshold: ${this.config.passThreshold}`);
    console.log(`[LoopEngine] Max attempts: ${this.config.maxAttempts}`);
    console.log(`[LoopEngine] Output dir: ${agentOutputDir}\n`);

    while (attempt <= this.config.maxAttempts) {
      console.log(`[LoopEngine] === Attempt ${attempt}/${this.config.maxAttempts} ===`);
      const startTime = Date.now();
      let output: string;
      let artifactPath: string | null = null;

      try {
        // Step 1: Produce (or Revise)
        if (attempt === 1) {
          console.log(`[LoopEngine] Running producer...`);
          output = await this.runProducer(this.config.producerInputs);
        } else {
          console.log(`[LoopEngine] Running reviser...`);
          output = await this.runReviser(lastOutput!, lastEvaluation!, attempt);
        }

        // Save output artifact
        artifactPath = path.join(agentOutputDir, `attempt-${attempt}.md`);
        fs.writeFileSync(artifactPath, output);
        console.log(`[LoopEngine] Saved artifact: ${artifactPath}`);

        const producedStatus = attempt === 1 ? 'produced' : 'revised';
        await this.recordRun(this.createRunRecord(attempt, producedStatus, {
          artifact_path: artifactPath,
        }));

        // Step 2: Evaluate
        console.log(`[LoopEngine] Running evaluator...`);
        const evaluation = await this.runEvaluator(output);
        const evalPath = path.join(agentOutputDir, `attempt-${attempt}.eval.json`);
        fs.writeFileSync(evalPath, JSON.stringify(evaluation, null, 2));
        console.log(`[LoopEngine] Saved evaluation: ${evalPath}`);
        console.log(`[LoopEngine] Score: ${evaluation.overallScore.toFixed(2)} (threshold: ${this.config.passThreshold})`);

        const evalRecordBase: Partial<RunRecord> = {
          overall_score: evaluation.overallScore,
          dimension_scores: evaluation.dimensionScores,
          feedback: evaluation.feedback,
          suggested_fixes: evaluation.suggestedFixes,
          artifact_path: artifactPath,
          duration_ms: Date.now() - startTime,
          rubric_version: this.rubric.metadata?.version || '1.0.0',
        };

        await this.recordRun(this.createRunRecord(attempt, 'evaluated', evalRecordBase));

        // Step 3: Check if passed
        if (evaluation.passed && evaluation.overallScore >= this.config.passThreshold) {
          await this.recordRun(this.createRunRecord(attempt, 'passed', evalRecordBase));

          // Create final copy
          const finalPath = path.join(agentOutputDir, 'final.md');
          fs.copyFileSync(artifactPath, finalPath);
          console.log(`\n[LoopEngine] ✓ PASSED on attempt ${attempt}`);
          console.log(`[LoopEngine] Final artifact: ${finalPath}\n`);

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
        console.log(`[LoopEngine] ✗ Failed (score: ${evaluation.overallScore.toFixed(2)})`);
        console.log(`[LoopEngine] Feedback: ${evaluation.feedback}`);
        if (evaluation.suggestedFixes.length > 0) {
          console.log(`[LoopEngine] Fixes needed:`);
          evaluation.suggestedFixes.forEach((fix, i) => {
            console.log(`  ${i + 1}. ${fix}`);
          });
        }

        await this.recordRun(this.createRunRecord(attempt, 'failed', evalRecordBase));

        lastOutput = output;
        lastEvaluation = evaluation;
        attempt++;

      } catch (error) {
        console.error(`[LoopEngine] Error on attempt ${attempt}:`, error);
        await this.recordRun(this.createRunRecord(attempt, 'failed', {
          artifact_path: artifactPath,
          feedback: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now() - startTime,
          rubric_version: this.rubric.metadata?.version || '1.0.0',
        }));
        attempt++;
      }
    }

    // Exhausted all attempts — escalate
    const escalationReason = `Failed to reach threshold (${this.config.passThreshold}) after ${this.config.maxAttempts} attempts. Last score: ${lastEvaluation?.overallScore?.toFixed(2) || 'N/A'}`;

    console.log(`\n[LoopEngine] ⚠ ESCALATED`);
    console.log(`[LoopEngine] Reason: ${escalationReason}\n`);

    return {
      success: false,
      finalAttempt: this.config.maxAttempts,
      finalScore: lastEvaluation?.overallScore || null,
      artifactPath: null,
      allRuns: this.runs,
      escalated: true,
      escalationReason,
    };
  }

  /**
   * Create a new run record
   */
  private createRunRecord(
    attempt: number,
    status: RunRecord['status'],
    overrides: Partial<RunRecord> = {}
  ): RunRecord {
    return {
      cycle_id: this.config.cycleId,
      agent_name: this.config.agentName,
      attempt,
      status,
      overall_score: null,
      dimension_scores: null,
      feedback: null,
      suggested_fixes: null,
      artifact_path: null,
      created_at: new Date().toISOString(),
      duration_ms: null,
      rubric_version: null,
      ...overrides,
    };
  }

  private async recordRun(run: RunRecord): Promise<void> {
    this.runs.push(run);
    await this.logRun(run);
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private async getOpenAIClient(): Promise<any> {
    if (this.openaiClient) return this.openaiClient;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const dashboardPackage = path.join(this.projectRoot, 'dashboard', 'package.json');
    const requireFromDashboard = createRequire(dashboardPackage);
    let openaiPath: string;
    try {
      openaiPath = requireFromDashboard.resolve('openai');
    } catch (error) {
      throw new Error(
        'OpenAI SDK not found. Install it in dashboard: npm install openai'
      );
    }

    const openaiModule = await import(pathToFileURL(openaiPath).href);
    const OpenAIClient = openaiModule.default ?? openaiModule.OpenAI;
    if (!OpenAIClient) {
      throw new Error('OpenAI SDK export not found. Check the installed openai package.');
    }

    this.openaiClient = new OpenAIClient({ apiKey });
    return this.openaiClient;
  }

  private async callOpenAI(
    messages: ChatMessage[],
    options: { temperature?: number; responseFormat?: 'json' | 'text' } = {}
  ): Promise<string> {
    const client = await this.getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: this.getModel(),
      messages,
      temperature: options.temperature ?? 0.2,
      ...(options.responseFormat === 'json'
        ? { response_format: { type: 'json_object' } }
        : {}),
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response was empty.');
    }
    return content.trim();
  }

  private async getDbModule(): Promise<{ db: any; agentRuns: any }> {
    if (this.dbModulePromise) return this.dbModulePromise;

    const dbPath = path.join(this.projectRoot, 'dashboard', 'server', 'db', 'client.ts');
    const dbUrl = pathToFileURL(dbPath).href;

    this.dbModulePromise = import(dbUrl).then((mod) => {
      if (!mod.db || !mod.agentRuns) {
        throw new Error('Database module missing db or agentRuns export.');
      }
      return { db: mod.db, agentRuns: mod.agentRuns };
    });

    return this.dbModulePromise;
  }

  private wrapBlock(content: string, language: string = ''): string {
    const lang = language ? language : '';
    return `\`\`\`${lang}\n${content}\n\`\`\``;
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  private resolveInputValue(value: unknown): { value: string; sourcePath?: string } {
    if (typeof value === 'string') {
      const candidates: string[] = [];
      if (path.isAbsolute(value)) candidates.push(value);
      candidates.push(path.join(this.projectRoot, value));
      candidates.push(path.join(this.projectRoot, 'SYSTEM', value));

      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return {
            value: fs.readFileSync(candidate, 'utf-8'),
            sourcePath: candidate,
          };
        }
      }

      return { value };
    }

    if (value === null || value === undefined) {
      return { value: '' };
    }

    if (typeof value === 'object') {
      return { value: this.safeStringify(value) };
    }

    return { value: String(value) };
  }

  private buildInputsBlock(inputs: Record<string, unknown>): string {
    const sections = Object.entries(inputs).map(([key, value]) => {
      const resolved = this.resolveInputValue(value);
      const sourceLabel = resolved.sourcePath ? ` (source: ${resolved.sourcePath})` : '';
      return `## ${key}${sourceLabel}\n${this.wrapBlock(resolved.value, 'text')}`;
    });

    return sections.join('\n\n');
  }

  private validateEvaluatorOutput(value: any): value is EvaluatorOutput {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

    const allowedKeys = new Set([
      'overallScore',
      'passed',
      'dimensionScores',
      'feedback',
      'suggestedFixes',
    ]);

    const keys = Object.keys(value);
    if (keys.length !== allowedKeys.size) return false;
    for (const key of keys) {
      if (!allowedKeys.has(key)) return false;
    }

    if (typeof value.overallScore !== 'number' || !Number.isFinite(value.overallScore)) {
      return false;
    }

    if (value.overallScore < 0 || value.overallScore > 1) return false;

    if (typeof value.passed !== 'boolean') return false;
    if (typeof value.feedback !== 'string') return false;

    if (!Array.isArray(value.suggestedFixes)) return false;
    if (value.suggestedFixes.some((fix: unknown) => typeof fix !== 'string')) return false;

    if (!value.dimensionScores || typeof value.dimensionScores !== 'object' || Array.isArray(value.dimensionScores)) {
      return false;
    }

    const rubricDimensions = Object.keys(this.rubric?.dimensions || {});
    const dimensionKeys = Object.keys(value.dimensionScores);
    if (dimensionKeys.length !== rubricDimensions.length) return false;

    for (const dimension of rubricDimensions) {
      if (!(dimension in value.dimensionScores)) return false;
      const score = value.dimensionScores[dimension];
      if (typeof score !== 'number' || !Number.isFinite(score)) return false;
      if (score < 0 || score > 1) return false;
    }

    for (const key of dimensionKeys) {
      if (!rubricDimensions.includes(key)) return false;
    }

    const shouldPass = value.overallScore >= this.config.passThreshold;
    if (value.passed !== shouldPass) return false;

    return true;
  }

  private parseEvaluatorOutput(raw: string): EvaluatorOutput {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      throw new Error('Evaluator response is not pure JSON.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      throw new Error('Evaluator response is not valid JSON.');
    }

    if (!this.validateEvaluatorOutput(parsed)) {
      throw new Error('Evaluator response failed schema validation.');
    }

    return parsed;
  }

  /**
   * Run the producer agent
   */
  private async runProducer(inputs: Record<string, unknown>): Promise<string> {
    const promptPath = path.join(this.projectRoot, 'SYSTEM', this.config.producerPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');

    const inputsBlock = this.buildInputsBlock(inputs);
    const userMessage = [
      'Inputs:',
      inputsBlock,
      '',
      'Return ONLY the markdown output described in the prompt.',
    ].join('\n');

    const response = await this.callOpenAI(
      [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.4 }
    );

    if (!response) {
      throw new Error('Producer returned empty output.');
    }

    return response;
  }

  /**
   * Run the evaluator agent
   */
  private async runEvaluator(output: string): Promise<EvaluatorOutput> {
    const promptPath = path.join(this.projectRoot, 'SYSTEM', this.config.evaluatorPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    const rubricPath = path.join(this.projectRoot, 'SYSTEM', this.config.rubricPath);
    const rubricContent = fs.readFileSync(rubricPath, 'utf-8');
    const inputsBlock = this.buildInputsBlock(this.config.producerInputs);

    const dimensionKeys = Object.keys(this.rubric?.dimensions || {});
    const schemaInstruction = [
      'Return ONLY valid JSON with this exact structure:',
      '{',
      '  "overallScore": number,',
      '  "passed": boolean,',
      `  "dimensionScores": { ${dimensionKeys.map((k) => `"${k}": number`).join(', ')} },`,
      '  "feedback": string,',
      '  "suggestedFixes": string[]',
      '}',
      'No extra keys. Dimension scores must match the rubric exactly.',
      `Set "passed" to true ONLY if overallScore >= ${this.config.passThreshold}.`,
    ].join('\n');

    const userMessage = [
      'Target list:',
      this.wrapBlock(output, 'markdown'),
      '',
      'Rubric:',
      this.wrapBlock(rubricContent, 'yaml'),
      '',
      'Inputs:',
      inputsBlock,
    ].join('\n');

    const systemMessage = `${prompt}\n\n${schemaInstruction}`;

    const initialResponse = await this.callOpenAI(
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0, responseFormat: 'json' }
    );

    try {
      return this.parseEvaluatorOutput(initialResponse);
    } catch (error) {
      const repairSystemMessage = [
        systemMessage,
        '',
        'IMPORTANT: Return ONLY valid JSON. Do not include any extra text or markdown.',
      ].join('\n');

      const repairResponse = await this.callOpenAI(
        [
          { role: 'system', content: repairSystemMessage },
          { role: 'user', content: userMessage },
        ],
        { temperature: 0, responseFormat: 'json' }
      );

      return this.parseEvaluatorOutput(repairResponse);
    }
  }

  /**
   * Run the reviser agent
   */
  private async runReviser(
    originalOutput: string,
    evaluation: EvaluatorOutput,
    attempt: number
  ): Promise<string> {
    const promptPath = path.join(this.projectRoot, 'SYSTEM', this.config.reviserPrompt);
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    const inputsBlock = this.buildInputsBlock(this.config.producerInputs);

    const userMessage = [
      `Revision attempt: ${attempt}`,
      '',
      'Original output:',
      this.wrapBlock(originalOutput, 'markdown'),
      '',
      'Evaluation JSON:',
      this.wrapBlock(this.safeStringify(evaluation), 'json'),
      '',
      'Inputs:',
      inputsBlock,
      '',
      'Return ONLY the revised markdown output described in the prompt.',
    ].join('\n');

    const response = await this.callOpenAI(
      [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.3 }
    );

    if (!response) {
      throw new Error('Reviser returned empty output.');
    }

    return response;
  }

  /**
   * Log run to file (and optionally database)
   */
  private async logRun(run: RunRecord): Promise<void> {
    // Write to JSON file log
    const logPath = path.join(
      this.projectRoot,
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

    try {
      const { db, agentRuns } = await this.getDbModule();
      await db.insert(agentRuns).values({
        cycleId: run.cycle_id,
        agentName: run.agent_name,
        attempt: run.attempt,
        status: run.status,
        overallScore: run.overall_score,
        dimensionScores: run.dimension_scores
          ? JSON.stringify(run.dimension_scores)
          : null,
        feedback: run.feedback,
        artifactPath: run.artifact_path,
        createdAt: run.created_at,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[LoopEngine] Failed to log to agent_runs: ${message}`);
    }
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
  const projectRoot = findProjectRoot(process.cwd());

  // Load agent config
  const configPath = path.join(projectRoot, 'SYSTEM/config/agents.yaml');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = parseYaml(configContent) as ConfigFile;

  const agentConfig = config.agents[agentName];
  if (!agentConfig) {
    const available = Object.keys(config.agents).join(', ');
    throw new Error(`Agent "${agentName}" not found in config. Available: ${available}`);
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

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Growth OS Loop Engine
======================

Usage: npx ts-node SYSTEM/orchestrator/loop-engine.ts <cycle-id> <agent-name>

Arguments:
  cycle-id     Unique identifier for this cycle (e.g., 2026-01-31-001)
  agent-name   Name of the agent to run (e.g., target_builder)

Example:
  npx ts-node SYSTEM/orchestrator/loop-engine.ts 2026-01-31-001 target_builder

Available Agents:
  target_builder    Build trigger-qualified target lists

Output:
  WORK/runs/<cycle-id>/<agent-name>/
    ├── attempt-1.md          # First attempt output
    ├── attempt-1.eval.json   # Evaluator result
    ├── attempt-2.md          # Revision (if needed)
    ├── attempt-2.eval.json
    ├── final.md              # Passing attempt (if successful)
    └── run-log.json          # All run records
`);
    process.exit(0);
  }

  const [cycleId, agentName] = args;

  console.log('Growth OS Loop Engine');
  console.log('======================\n');

  // Default inputs for target_builder
  const inputs: Record<string, unknown> = {
    thesis: 'LATAM Fintech Series A Recipients',
    trigger_library: 'config/triggers.yaml',
    target_history: 'KNOWLEDGE/target-history.md',
    active_pipeline: 'KNOWLEDGE/target-pipeline.md',
  };

  try {
    const engine = createLoopEngine(cycleId, agentName, inputs);
    const result = await engine.runLoop();

    console.log('\n=== Loop Complete ===');
    console.log('Success:', result.success);
    console.log('Final Attempt:', result.finalAttempt);
    console.log('Final Score:', result.finalScore?.toFixed(2) || 'N/A');
    console.log('Artifact Path:', result.artifactPath || 'N/A');
    console.log('Escalated:', result.escalated);
    if (result.escalationReason) {
      console.log('Escalation Reason:', result.escalationReason);
    }

    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\nLoop failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
