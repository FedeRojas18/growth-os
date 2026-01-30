import fs from 'fs/promises';
import path from 'path';
import { parseTableAfterHeader } from './markdown-parser.js';

export type PartnerState = 'Identified' | 'Researching' | 'Outreach' | 'Conversation' | 'Active' | 'Paused' | 'Closed';
export type PartnerType = 'Referral' | 'Co-marketing' | 'Integration' | 'Strategic';

export interface Partner {
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

export interface PartnerSummary {
  byState: Record<PartnerState, number>;
  totalActive: number;
  staleCount: number;
}

export interface PartnerPipelineData {
  partners: Partner[];
  summary: PartnerSummary;
  activePartnerships: Partner[];
  paused: Partner[];
  lastUpdated: string;
}

export async function parsePartnerPipeline(rootDir: string): Promise<PartnerPipelineData> {
  const filePath = path.join(rootDir, 'KNOWLEDGE', 'partnership-pipeline.md');
  const content = await fs.readFile(filePath, 'utf-8');

  // Parse active pipeline
  const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
  const partners: Partner[] = [];

  if (activeTable) {
    for (const row of activeTable.rows) {
      // Skip template/placeholder rows
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

  // Parse active partnerships
  const activePartnershipsTable = parseTableAfterHeader(content, 'Active Partnerships');
  const activePartnerships: Partner[] = [];
  if (activePartnershipsTable) {
    for (const row of activePartnershipsTable.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      activePartnerships.push({
        id: slugify(row['Partner']),
        name: row['Partner'] || '',
        type: row['Type'] || '',
        state: 'Active',
        primaryBU: row['Primary BU'] || '',
        keyContact: row['Key Contact'] || '',
        lastTouch: row['Since'] || '',
        nextAction: row['Notes'] || '',
        owner: '',
        isStale: false
      });
    }
  }

  // Parse paused
  const pausedTable = parseTableAfterHeader(content, 'Paused Partnerships');
  const paused: Partner[] = [];
  if (pausedTable) {
    for (const row of pausedTable.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      paused.push({
        id: slugify(row['Partner']),
        name: row['Partner'] || '',
        type: row['Type'] || '',
        state: 'Paused',
        primaryBU: '',
        keyContact: '',
        lastTouch: row['Paused Date'] || '',
        nextAction: row['Re-engage Trigger'] || '',
        owner: '',
        isStale: false
      });
    }
  }

  const summary = calculateSummary(partners);

  return {
    partners,
    summary,
    activePartnerships,
    paused,
    lastUpdated: new Date().toISOString()
  };
}

function calculateSummary(partners: Partner[]): PartnerSummary {
  const byState: Record<PartnerState, number> = {
    'Identified': 0,
    'Researching': 0,
    'Outreach': 0,
    'Conversation': 0,
    'Active': 0,
    'Paused': 0,
    'Closed': 0
  };

  let staleCount = 0;

  for (const partner of partners) {
    byState[partner.state] = (byState[partner.state] || 0) + 1;
    if (partner.isStale) staleCount++;
  }

  return {
    byState,
    totalActive: partners.length,
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
