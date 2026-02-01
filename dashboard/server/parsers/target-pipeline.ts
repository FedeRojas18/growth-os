import fs from 'fs/promises';
import path from 'path';
import { parseTableAfterHeader } from './markdown-parser.js';
import { db } from '../db/client.js';
import { stateOverrides, nextActionOverrides } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export type TargetState = 'New' | 'Contacted' | 'Replied' | 'Meeting' | 'Passed' | 'Closed-Lost' | 'Nurture';

export interface Target {
  id: string;
  company: string;
  buFit: string;
  trigger: string;
  state: TargetState;
  lastTouch: string;
  channel: string;
  nextAction: string;
  nextActionDueDate: string | null;
  owner: string;
  isStale: boolean;
  daysInState: number;
}

export interface PipelineSummary {
  byState: Record<TargetState, number>;
  totalActive: number;
  staleCount: number;
}

export interface TargetPipelineData {
  targets: Target[];
  summary: PipelineSummary;
  closedLost: Target[];
  nurture: Target[];
  lastUpdated: string;
}

export async function parseTargetPipeline(rootDir: string): Promise<TargetPipelineData> {
  const filePath = path.join(rootDir, 'KNOWLEDGE', 'target-pipeline.md');

  // Fetch markdown and database overrides in parallel
  const [content, dbStateOverrides, dbNextActionOverrides] = await Promise.all([
    fs.readFile(filePath, 'utf-8'),
    db.select().from(stateOverrides).where(eq(stateOverrides.entityType, 'target')),
    db.select().from(nextActionOverrides).where(eq(nextActionOverrides.entityType, 'target')),
  ]);

  // Create lookup maps for overrides
  const stateOverrideMap = new Map(
    dbStateOverrides.map(o => [o.entityId, { state: o.state, lastTouch: o.lastTouch }])
  );
  const nextActionOverrideMap = new Map(
    dbNextActionOverrides.map(o => [o.entityId, { nextAction: o.nextAction, dueDate: o.dueDate }])
  );

  // Parse active pipeline
  const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
  const targets: Target[] = [];

  if (activeTable) {
    for (const row of activeTable.rows) {
      // Skip template/placeholder rows
      if (row['Company']?.startsWith('[') || !row['Company']) {
        continue;
      }

      const id = slugify(row['Company']);

      // Apply state override if exists
      const stateOverride = stateOverrideMap.get(id);
      const state = (stateOverride?.state || row['State'] || 'New') as TargetState;
      const lastTouch = stateOverride?.lastTouch || row['Last Touch'] || '';

      // Apply next action override if exists
      const nextActionOverride = nextActionOverrideMap.get(id);
      const nextAction = nextActionOverride?.nextAction || row['Next Action'] || '';
      const nextActionDueDate = nextActionOverride?.dueDate || null;

      const daysAgo = calculateDaysAgo(lastTouch);

      targets.push({
        id,
        company: row['Company'] || '',
        buFit: row['BU Fit'] || '',
        trigger: row['Trigger'] || '',
        state,
        lastTouch,
        channel: row['Channel'] || '',
        nextAction,
        nextActionDueDate,
        owner: row['Owner'] || 'TBD',
        isStale: daysAgo > 14,
        daysInState: daysAgo
      });
    }
  }

  // Parse closed-lost
  const closedTable = parseTableAfterHeader(content, 'Closed-Lost Archive');
  const closedLost: Target[] = [];
  if (closedTable) {
    for (const row of closedTable.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      closedLost.push({
        id: slugify(row['Company']),
        company: row['Company'] || '',
        buFit: row['BU Fit'] || '',
        trigger: row['Original Trigger'] || '',
        state: 'Closed-Lost',
        lastTouch: row['Closed Date'] || '',
        channel: '',
        nextAction: '',
        nextActionDueDate: null,
        owner: '',
        isStale: false,
        daysInState: 0
      });
    }
  }

  // Parse nurture
  const nurtureTable = parseTableAfterHeader(content, 'Nurture List');
  const nurture: Target[] = [];
  if (nurtureTable) {
    for (const row of nurtureTable.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      nurture.push({
        id: slugify(row['Company']),
        company: row['Company'] || '',
        buFit: row['BU Fit'] || '',
        trigger: row['Original Trigger'] || '',
        state: 'Nurture',
        lastTouch: row['Nurture Date'] || '',
        channel: '',
        nextAction: row['Re-engage Trigger'] || '',
        nextActionDueDate: null,
        owner: '',
        isStale: false,
        daysInState: 0
      });
    }
  }

  // Calculate summary
  const summary = calculateSummary(targets);

  return {
    targets,
    summary,
    closedLost,
    nurture,
    lastUpdated: new Date().toISOString()
  };
}

function calculateSummary(targets: Target[]): PipelineSummary {
  const byState: Record<TargetState, number> = {
    'New': 0,
    'Contacted': 0,
    'Replied': 0,
    'Meeting': 0,
    'Passed': 0,
    'Closed-Lost': 0,
    'Nurture': 0
  };

  let staleCount = 0;

  for (const target of targets) {
    byState[target.state] = (byState[target.state] || 0) + 1;
    if (target.isStale) staleCount++;
  }

  return {
    byState,
    totalActive: targets.length,
    staleCount
  };
}

function calculateDaysAgo(dateStr: string): number {
  if (!dateStr || dateStr === '—') return 0;
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
