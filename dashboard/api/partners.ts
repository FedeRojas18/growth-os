import { fetchMarkdownFromGitHub } from './_lib/github';
import { parseTableAfterHeader } from './_lib/markdown-parser';

export const config = {
  runtime: 'edge',
};

type PartnerState = 'Identified' | 'Researching' | 'Outreach' | 'Conversation' | 'Active' | 'Paused' | 'Closed';

interface Partner {
  id: string;
  name: string;
  type: string;
  state: PartnerState;
  primaryBU: string;
  keyContact: string;
  lastTouch: string;
  nextAction: string;
  owner: string;
  isStale: boolean;
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
    const content = await fetchMarkdownFromGitHub('KNOWLEDGE/partnership-pipeline.md');

    const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
    const partners: Partner[] = [];

    if (activeTable) {
      for (const row of activeTable.rows) {
        if (row['Partner']?.startsWith('[') || !row['Partner']) {
          continue;
        }

        const lastTouch = row['Last Touch'] || '';
        const daysAgo = calculateDaysAgo(lastTouch);

        partners.push({
          id: slugify(row['Partner']),
          name: row['Partner'] || '',
          type: row['Type'] || '',
          state: (row['State'] || 'Identified') as PartnerState,
          primaryBU: row['Primary BU'] || '',
          keyContact: row['Key Contact'] || '',
          lastTouch,
          nextAction: row['Next Action'] || '',
          owner: row['Owner'] || 'TBD',
          isStale: daysAgo > 14
        });
      }
    }

    const byState: Record<PartnerState, number> = {
      'Identified': 0, 'Researching': 0, 'Outreach': 0,
      'Conversation': 0, 'Active': 0, 'Paused': 0, 'Closed': 0
    };
    let staleCount = 0;

    for (const partner of partners) {
      byState[partner.state] = (byState[partner.state] || 0) + 1;
      if (partner.isStale) staleCount++;
    }

    return Response.json({
      partners,
      summary: { byState, totalActive: partners.length, staleCount },
      activePartnerships: [],
      paused: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error parsing partnership pipeline:', error);
    return Response.json(
      { error: 'Failed to parse partnership pipeline' },
      { status: 500 }
    );
  }
}
