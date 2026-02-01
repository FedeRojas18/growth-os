import { activities, reminders } from './_lib/db/schema';
import { fetchMarkdownFromGitHub } from './_lib/github';
import { parseTableAfterHeader } from './_lib/markdown-parser';
import { getEdgeDb } from './_lib/db/client';

export const config = {
  runtime: 'edge',
};

interface TargetRow {
  id: string;
  company: string;
  state: string;
  lastTouch: string;
  nextAction: string;
}

interface PartnerRow {
  id: string;
  name: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isWithinLast7Days(date: Date, now: Date) {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return date >= sevenDaysAgo && date <= now;
}

const TARGET_STATE_ORDER = ['New', 'Contacted', 'Replied', 'Meeting', 'Passed', 'Closed-Lost', 'Nurture'];
const TARGET_STATE_INDEX = new Map(TARGET_STATE_ORDER.map((state, index) => [state, index]));

function summarizeStateChanges(
  activities: Array<{ entityId: string; entityType: string; createdAt: unknown; metadata: string | null }>,
  targetMap: Map<string, string>,
) {
  const grouped = new Map<string, Array<{ createdAt: Date; from?: string; to?: string }>>();

  activities
    .filter((activity) => activity.entityType === 'target')
    .forEach((activity) => {
      const createdAt = new Date(activity.createdAt as string);
      if (Number.isNaN(createdAt.getTime())) return;
      let meta: { from?: string; to?: string } = {};
      if (activity.metadata) {
        try {
          meta = JSON.parse(activity.metadata);
        } catch {
          meta = {};
        }
      }
      const list = grouped.get(activity.entityId) || [];
      list.push({ createdAt, from: meta.from, to: meta.to });
      grouped.set(activity.entityId, list);
    });

  const summaries = Array.from(grouped.entries()).map(([entityId, moves]) => {
    const sorted = moves.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const start = first.from || 'Unknown';
    const end = last.to || 'Unknown';
    const startIdx = TARGET_STATE_INDEX.get(start);
    const endIdx = TARGET_STATE_INDEX.get(end);
    let direction: 'forward' | 'reverted' | 'neutral' | 'none' = 'neutral';
    if (start === end) {
      direction = 'none';
    } else if (startIdx !== undefined && endIdx !== undefined) {
      direction = endIdx > startIdx ? 'forward' : 'reverted';
    }

    return {
      entityId,
      name: targetMap.get(entityId) || entityId,
      start,
      end,
      direction,
    };
  });

  const forward = summaries.filter(s => s.direction === 'forward');
  const neutral = summaries.filter(s => s.direction === 'neutral');
  const reverted = summaries.filter(s => s.direction === 'reverted' || s.direction === 'none');

  return [...forward, ...neutral, ...reverted].slice(0, 8);
}

function getWeekOfLabel(now: Date) {
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadTargets(): Promise<TargetRow[]> {
  const content = await fetchMarkdownFromGitHub('KNOWLEDGE/target-pipeline.md');
  const rows: TargetRow[] = [];
  const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
  if (activeTable) {
    for (const row of activeTable.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      rows.push({
        id: slugify(row['Company']),
        company: row['Company'] || '',
        state: row['State'] || 'New',
        lastTouch: row['Last Touch'] || '',
        nextAction: row['Next Action'] || '',
      });
    }
  }
  return rows;
}

async function loadPartners(): Promise<PartnerRow[]> {
  const content = await fetchMarkdownFromGitHub('KNOWLEDGE/partnership-pipeline.md');
  const rows: PartnerRow[] = [];
  const activeTable = parseTableAfterHeader(content, 'Active Pipeline');
  if (activeTable) {
    for (const row of activeTable.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      rows.push({
        id: slugify(row['Partner']),
        name: row['Partner'] || '',
      });
    }
  }
  return rows;
}

export default async function handler() {
  try {
    const db = getEdgeDb();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const [targetRows, partnerRows, activityRows, reminderRows] = await Promise.all([
      loadTargets(),
      loadPartners(),
      db ? db.select().from(activities) : Promise.resolve([]),
      db ? db.select().from(reminders) : Promise.resolve([]),
    ]);

    const targetMap = new Map(targetRows.map(t => [t.id, t.company]));
    const partnerMap = new Map(partnerRows.map(p => [p.id, p.name]));

    const recentActivities = activityRows.filter((activity) => {
      const createdAt = new Date(activity.createdAt);
      return isWithinLast7Days(createdAt, now);
    });

    const stateChanges = recentActivities.filter(a => a.type === 'state_change');
    const notes = recentActivities.filter(a => a.type === 'note');
    const touches = recentActivities.filter(a => a.type !== 'state_change');

    const mostActiveCounts = new Map<string, number>();
    touches.forEach((activity) => {
      if (activity.entityType !== 'target') return;
      mostActiveCounts.set(activity.entityId, (mostActiveCounts.get(activity.entityId) || 0) + 1);
    });

    const mostActiveTargets = Array.from(mostActiveCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => targetMap.get(id) || id);

    const newTargetsAdded = targetRows.filter((target) => {
      if (target.state !== 'New') return false;
      const date = parseDate(target.lastTouch);
      return date ? isWithinLast7Days(date, now) : false;
    }).length;

    const overdueReminders = reminderRows.filter(r => !r.isComplete && r.dueDate < todayStr);
    const dueTodayReminders = reminderRows.filter(r => !r.isComplete && r.dueDate === todayStr);
    const upcomingReminders = reminderRows.filter(r => !r.isComplete && r.dueDate > todayStr);

    const staleTargets = targetRows.filter((target) => {
      const date = parseDate(target.lastTouch);
      if (!date) return true;
      const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 14;
    });

    const noNextActionTargets = targetRows.filter((target) =>
      (target.state === 'Contacted' || target.state === 'Replied') && !target.nextAction?.trim()
    );

    const attentionItems = [
      ...overdueReminders.map(r => ({ name: targetMap.get(r.entityId) || partnerMap.get(r.entityId) || r.entityId, reason: 'Overdue' })),
      ...dueTodayReminders.map(r => ({ name: targetMap.get(r.entityId) || partnerMap.get(r.entityId) || r.entityId, reason: 'Today' })),
      ...staleTargets.map(t => ({ name: t.company, reason: 'Stale' })),
      ...noNextActionTargets.map(t => ({ name: t.company, reason: 'No Next Action' })),
    ].slice(0, 3);

    const movementSummaries = summarizeStateChanges(stateChanges, targetMap);
    const movementLines = movementSummaries.map((summary) => {
      if (summary.direction === 'none') {
        return `- **${summary.name}** ⚠️ No net progress`;
      }
      const icon = summary.direction === 'forward' ? '✅' : '⚠️';
      return `- **${summary.name}** ${icon} ${summary.start} → ${summary.end}`;
    });

    const overdueLines = overdueReminders.slice(0, 5).map((r) => {
      const name = r.entityType === 'target'
        ? targetMap.get(r.entityId) || r.entityId
        : partnerMap.get(r.entityId) || r.entityId;
      return `- ${name}: ${r.note} (overdue)`;
    });
    const dueSoonLines = upcomingReminders.slice(0, 5).map((r) => {
      const name = r.entityType === 'target'
        ? targetMap.get(r.entityId) || r.entityId
        : partnerMap.get(r.entityId) || r.entityId;
      return `- ${name}: ${r.note} (due ${r.dueDate})`;
    });

    const digest = [
      `# Weekly Growth Digest (Week of ${getWeekOfLabel(now)})`,
      '',
      '## Wins / Progress',
      `- ${newTargetsAdded} new targets added`,
      `- ${stateChanges.length} pipeline stage moves`,
      '',
      '## Pipeline Movement',
      ...(movementLines.length ? movementLines : ['- No meaningful pipeline movement this week']),
      '',
      '## Activity + Touches',
      `- ${notes.length} notes logged`,
      `- Most active targets: ${mostActiveTargets.length ? mostActiveTargets.join(', ') : 'N/A'}`,
      '',
      '## Follow-ups Needed Next Week',
      ...(overdueLines.length ? overdueLines : ['- No overdue reminders']),
      ...(dueSoonLines.length ? dueSoonLines : ['- No upcoming reminders']),
      '',
      '## Top Priorities',
      ...(attentionItems.length
        ? attentionItems.map(item => `- ${item.name} — ${item.reason}`)
        : ['- No urgent priorities']),
    ].join('\n');

    return Response.json({ markdown: digest });
  } catch (error) {
    console.error('Error generating digest:', error);
    return Response.json({ error: 'Failed to generate digest' }, { status: 500 });
  }
}
