import { fetchMarkdownFromGitHub } from './_lib/github';
import { parseTableAfterHeader } from './_lib/markdown-parser';

export const config = {
  runtime: 'edge',
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

export default async function handler() {
  try {
    const content = await fetchMarkdownFromGitHub('KNOWLEDGE/target-pipeline.md');

    const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
    const targets: Target[] = [];

    if (activeTable) {
      for (const row of activeTable.rows) {
        if (row['Company']?.startsWith('[') || !row['Company']) {
          continue;
        }

        const lastTouch = row['Last Touch'] || '';
        const daysAgo = calculateDaysAgo(lastTouch);

        targets.push({
          id: slugify(row['Company']),
          company: row['Company'] || '',
          buFit: row['BU Fit'] || '',
          trigger: row['Trigger'] || '',
          state: (row['State'] || 'New') as TargetState,
          lastTouch,
          channel: row['Channel'] || '',
          nextAction: row['Next Action'] || '',
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

    return Response.json({
      targets,
      summary: { byState, totalActive: targets.length, staleCount },
      closedLost: [],
      nurture: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error parsing target pipeline:', error);
    return Response.json(
      { error: 'Failed to parse target pipeline' },
      { status: 500 }
    );
  }
}
