import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { activities } from './_lib/db/schema';

export const config = {
  runtime: 'edge',
};

function getDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client);
}

function toISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(toISODate(d));
  }
  return days;
}

export default async function handler() {
  try {
    const db = getDb();
    const rows = await db.select().from(activities);

    const today = new Date();
    const start14 = new Date(today);
    start14.setDate(today.getDate() - 13);
    const start7 = new Date(today);
    start7.setDate(today.getDate() - 6);

    const touchesByDayMap = new Map<string, number>();
    lastNDays(14).forEach((date) => touchesByDayMap.set(date, 0));

    const activityByTargetMap = new Map<string, number>();
    const stateChanges: Array<{ entityId: string; from?: string; to?: string; createdAt: string }> = [];

    rows.forEach((activity) => {
      if (activity.type !== 'note' && activity.type !== 'state_change') return;
      const createdAt = new Date(activity.createdAt as unknown as string);
      if (Number.isNaN(createdAt.getTime())) return;
      const dateKey = toISODate(createdAt);

      if (createdAt >= start14 && createdAt <= today) {
        touchesByDayMap.set(dateKey, (touchesByDayMap.get(dateKey) || 0) + 1);
      }

      if (activity.entityType === 'target' && createdAt >= start7 && createdAt <= today) {
        activityByTargetMap.set(
          activity.entityId,
          (activityByTargetMap.get(activity.entityId) || 0) + 1
        );
      }

      if (activity.type === 'state_change' && activity.entityType === 'target' && createdAt >= start7 && createdAt <= today) {
        let meta: { from?: string; to?: string } = {};
        if (activity.metadata) {
          try {
            meta = JSON.parse(activity.metadata);
          } catch {
            meta = {};
          }
        }
        stateChanges.push({
          entityId: activity.entityId,
          from: meta.from,
          to: meta.to,
          createdAt: createdAt.toISOString(),
        });
      }
    });

    const touchesByDay = Array.from(touchesByDayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const activityByTarget = Array.from(activityByTargetMap.entries()).map(([entityId, count]) => ({
      entityId,
      count,
    }));

    return Response.json({
      touchesByDay,
      activityByTarget,
      stateChanges,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error building insights:', error);
    return Response.json({ error: 'Failed to build insights' }, { status: 500 });
  }
}
