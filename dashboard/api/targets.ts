import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stateOverrides, nextActionOverrides } from './_lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { fetchMarkdownFromGitHub } from './_lib/github.js';
import { parseTableAfterHeader } from './_lib/markdown-parser.js';
import { getEdgeDb } from './_lib/db/client.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

type TargetState = 'New' | 'Contacted' | 'Replied' | 'Meeting' | 'Passed' | 'Closed-Lost' | 'Nurture';

interface Target {
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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const env = requireTursoEnv(res);
    if (!env.ok) return;
    const db = getEdgeDb(env.url, env.token);
    if (!db) {
      res.status(503).json({ error: 'TURSO env missing' });
      return;
    }

    // Fetch markdown data and database overrides in parallel
    const [content, dbStateOverrides, dbNextActionOverrides] = await Promise.all([
      fetchMarkdownFromGitHub('KNOWLEDGE/target-pipeline.md'),
      db.select().from(stateOverrides).where(eq(stateOverrides.entityType, 'target')),
      db.select().from(nextActionOverrides).where(eq(nextActionOverrides.entityType, 'target')),
    ]);

    // Create lookup maps for overrides
    const stateOverrideMap = new Map<string, { state: string; lastTouch: string }>(
      dbStateOverrides.map(o => [o.entityId, { state: o.state, lastTouch: o.lastTouch }] as [string, { state: string; lastTouch: string }])
    );
    const nextActionOverrideMap = new Map<string, { nextAction: string; dueDate: string | null }>(
      dbNextActionOverrides.map(o => [o.entityId, { nextAction: o.nextAction, dueDate: o.dueDate }] as [string, { nextAction: string; dueDate: string | null }])
    );

    const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
    const targets: Target[] = [];

    if (activeTable) {
      for (const row of activeTable.rows) {
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

    const byState: Record<TargetState, number> = {
      'New': 0, 'Contacted': 0, 'Replied': 0, 'Meeting': 0,
      'Passed': 0, 'Closed-Lost': 0, 'Nurture': 0
    };
    let staleCount = 0;

    for (const target of targets) {
      byState[target.state] = (byState[target.state] || 0) + 1;
      if (target.isStale) staleCount++;
    }

    res.status(200).json({
      targets,
      summary: { byState, totalActive: targets.length, staleCount },
      closedLost: [],
      nurture: [],
      lastUpdated: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Error parsing target pipeline:', error);
    res.status(500).json({ error: 'Failed to parse target pipeline' });
    return;
  }
}
