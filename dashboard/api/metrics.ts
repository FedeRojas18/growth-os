import { fetchMarkdownFromGitHub } from './_lib/github.js';
import { parseTableAfterHeader } from './_lib/markdown-parser.js';

export const config = {
  runtime: 'edge',
};

type TargetState = 'New' | 'Contacted' | 'Replied' | 'Meeting' | 'Passed' | 'Closed-Lost' | 'Nurture';
type PartnerState = 'Identified' | 'Researching' | 'Outreach' | 'Conversation' | 'Active' | 'Paused' | 'Closed';

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
    const [targetContent, partnerContent] = await Promise.all([
      fetchMarkdownFromGitHub('KNOWLEDGE/target-pipeline.md'),
      fetchMarkdownFromGitHub('KNOWLEDGE/partnership-pipeline.md')
    ]);

    // Parse targets
    const targetTable = parseTableAfterHeader(targetContent, 'Active Pipeline');
    const targetsByState: Record<TargetState, number> = {
      'New': 0, 'Contacted': 0, 'Replied': 0, 'Meeting': 0,
      'Passed': 0, 'Closed-Lost': 0, 'Nurture': 0
    };
    let totalTargets = 0;
    let staleTargets = 0;

    if (targetTable) {
      for (const row of targetTable.rows) {
        if (row['Company']?.startsWith('[') || !row['Company']) continue;
        totalTargets++;
        const state = (row['State'] || 'New') as TargetState;
        targetsByState[state] = (targetsByState[state] || 0) + 1;
        const daysAgo = calculateDaysAgo(row['Last Touch'] || '');
        if (daysAgo > 14) staleTargets++;
      }
    }

    // Parse partners
    const partnerTable = parseTableAfterHeader(partnerContent, 'Active Pipeline');
    const partnersByState: Record<PartnerState, number> = {
      'Identified': 0, 'Researching': 0, 'Outreach': 0,
      'Conversation': 0, 'Active': 0, 'Paused': 0, 'Closed': 0
    };
    let totalPartners = 0;
    let partnerConversations = 0;

    if (partnerTable) {
      for (const row of partnerTable.rows) {
        if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
        totalPartners++;
        const state = (row['State'] || 'Identified') as PartnerState;
        partnersByState[state] = (partnersByState[state] || 0) + 1;
        if (state === 'Conversation' || state === 'Active') {
          partnerConversations++;
        }
      }
    }

    // Calculate score
    let score = 0;
    const testPlanShipped = true; // Assume shipped for now
    const execUpdateShipped = true;

    if (testPlanShipped) score++;
    if (totalTargets >= 10) score++;
    if (partnerConversations >= 1) score++;
    if (execUpdateShipped) score++;
    // Pipeline state changes would need historical data

    const status = score >= 4 ? 'green' : score >= 3 ? 'yellow' : 'red';

    return Response.json({
      testPlanShipped,
      targetsAdded: totalTargets,
      targetGoal: 15,
      pipelineStateChanges: 0,
      stateChangeGoal: 3,
      partnerConversations,
      partnerGoal: 2,
      execUpdateShipped,
      score,
      status,
      pipelineSummary: {
        byState: targetsByState,
        totalActive: totalTargets,
        staleCount: staleTargets
      },
      partnerSummary: {
        byState: partnersByState,
        totalActive: totalPartners,
        staleCount: 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing metrics:', error);
    return Response.json(
      { error: 'Failed to compute metrics' },
      { status: 500 }
    );
  }
}
