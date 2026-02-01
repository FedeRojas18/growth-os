import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { reminders, nextActionOverrides } from './_lib/db/schema';
import { fetchMarkdownFromGitHub } from './_lib/github';
import { parseTableAfterHeader } from './_lib/markdown-parser';

export const config = {
  runtime: 'edge',
};

interface TodoItem {
  id: string;
  itemType: 'reminder' | 'next_action';
  entityType: 'target' | 'partner';
  entityId: string;
  entityName: string;
  entityTag?: string;
  dueDate: string;
  text: string;
  isComplete?: boolean;
  sourceId: number;
}

function getDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function buildTargetMap(): Promise<Map<string, { name: string; tag?: string }>> {
  const content = await fetchMarkdownFromGitHub('KNOWLEDGE/target-pipeline.md');
  const map = new Map<string, { name: string; tag?: string }>();

  const active = parseTableAfterHeader(content, 'Active Pipeline');
  if (active) {
    for (const row of active.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      const id = slugify(row['Company']);
      map.set(id, { name: row['Company'], tag: row['BU Fit'] || undefined });
    }
  }

  const closed = parseTableAfterHeader(content, 'Closed-Lost Archive');
  if (closed) {
    for (const row of closed.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      const id = slugify(row['Company']);
      if (!map.has(id)) {
        map.set(id, { name: row['Company'], tag: row['BU Fit'] || undefined });
      }
    }
  }

  const nurture = parseTableAfterHeader(content, 'Nurture List');
  if (nurture) {
    for (const row of nurture.rows) {
      if (row['Company']?.startsWith('[') || !row['Company']) continue;
      const id = slugify(row['Company']);
      if (!map.has(id)) {
        map.set(id, { name: row['Company'], tag: row['BU Fit'] || undefined });
      }
    }
  }

  return map;
}

async function buildPartnerMap(): Promise<Map<string, { name: string; tag?: string }>> {
  const content = await fetchMarkdownFromGitHub('KNOWLEDGE/partnership-pipeline.md');
  const map = new Map<string, { name: string; tag?: string }>();

  const active = parseTableAfterHeader(content, 'Active Pipeline');
  if (active) {
    for (const row of active.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      const id = slugify(row['Partner']);
      map.set(id, { name: row['Partner'], tag: row['Primary BU'] || undefined });
    }
  }

  const activePartnerships = parseTableAfterHeader(content, 'Active Partnerships');
  if (activePartnerships) {
    for (const row of activePartnerships.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      const id = slugify(row['Partner']);
      if (!map.has(id)) {
        map.set(id, { name: row['Partner'], tag: row['Primary BU'] || undefined });
      }
    }
  }

  const paused = parseTableAfterHeader(content, 'Paused Partnerships');
  if (paused) {
    for (const row of paused.rows) {
      if (row['Partner']?.startsWith('[') || !row['Partner']) continue;
      const id = slugify(row['Partner']);
      if (!map.has(id)) {
        map.set(id, { name: row['Partner'], tag: row['Primary BU'] || undefined });
      }
    }
  }

  return map;
}

export default async function handler() {
  try {
    const db = getDb();
    const [reminderRows, nextActionRows, targetMap, partnerMap] = await Promise.all([
      db.select().from(reminders),
      db.select().from(nextActionOverrides),
      buildTargetMap(),
      buildPartnerMap(),
    ]);

    const normalizeText = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const reminderIndex = new Map<string, number[]>();
    reminderRows.forEach((reminder) => {
      const key = `${reminder.entityType}:${reminder.entityId}:${reminder.dueDate}:${normalizeText(reminder.note)}`;
      const createdAt = new Date(reminder.createdAt as unknown as string).getTime();
      const list = reminderIndex.get(key) || [];
      list.push(createdAt);
      reminderIndex.set(key, list);
    });

    const items: TodoItem[] = [];

    for (const reminder of reminderRows) {
      const meta = reminder.entityType === 'target'
        ? targetMap.get(reminder.entityId)
        : partnerMap.get(reminder.entityId);
      items.push({
        id: `reminder-${reminder.id}`,
        itemType: 'reminder',
        entityType: reminder.entityType as 'target' | 'partner',
        entityId: reminder.entityId,
        entityName: meta?.name || reminder.entityId,
        entityTag: meta?.tag,
        dueDate: reminder.dueDate,
        text: reminder.note,
        isComplete: reminder.isComplete,
        sourceId: reminder.id,
      });
    }

    for (const nextAction of nextActionRows) {
      if (!nextAction.dueDate) continue;
      const key = `${nextAction.entityType}:${nextAction.entityId}:${nextAction.dueDate}:${normalizeText(nextAction.nextAction)}`;
      const updatedAt = new Date(nextAction.updatedAt as unknown as string).getTime();
      const reminderMatches = reminderIndex.get(key) || [];
      const hasRecentReminder = reminderMatches.some((timestamp) => Math.abs(timestamp - updatedAt) <= 120000);
      if (hasRecentReminder) {
        continue;
      }
      const meta = nextAction.entityType === 'target'
        ? targetMap.get(nextAction.entityId)
        : partnerMap.get(nextAction.entityId);
      items.push({
        id: `next-action-${nextAction.id}`,
        itemType: 'next_action',
        entityType: nextAction.entityType as 'target' | 'partner',
        entityId: nextAction.entityId,
        entityName: meta?.name || nextAction.entityId,
        entityTag: meta?.tag,
        dueDate: nextAction.dueDate,
        text: nextAction.nextAction,
        isComplete: false,
        sourceId: nextAction.id,
      });
    }

    return Response.json({
      items,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error building todos:', error);
    return Response.json({ error: 'Failed to build todos' }, { status: 500 });
  }
}
