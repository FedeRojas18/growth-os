import type { VercelRequest, VercelResponse } from '@vercel/node';
import { reminders } from './_lib/db/schema.js';
import { eq, and, lte, gte, desc } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }
  const url = getRequestUrl(req);

  // Route: POST /api/reminders - Create reminder
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { entityType, entityId, dueDate, note } = body;

      if (!entityType || !entityId || !dueDate || !note) {
        res.status(400).json({ error: 'Missing required fields: entityType, entityId, dueDate, note' });
        return;
      }

      const result = await db.insert(reminders).values({
        entityType,
        entityId,
        dueDate,
        note,
        isComplete: false,
        createdAt: new Date(),
      }).returning();

      res.status(201).json(result[0]);
      return;
    } catch (error) {
      console.error('Error creating reminder:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
      return;
    }
  }

  // Route: GET /api/reminders - Get all reminders (optionally filtered)
  // Query params: today=true (only today's), entityType, entityId
  if (req.method === 'GET') {
    try {
      const today = url.searchParams.get('today');
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');
      const includeComplete = url.searchParams.get('includeComplete') === 'true';

      let query = db.select().from(reminders);
      const conditions = [];

      // Filter by entity if provided
      if (entityType && entityId) {
        conditions.push(eq(reminders.entityType, entityType));
        conditions.push(eq(reminders.entityId, entityId));
      }

      // Filter for today's reminders
      if (today === 'true') {
        const todayStr = getTodayISO();
        conditions.push(lte(reminders.dueDate, todayStr));
      }

      // Exclude completed unless requested
      if (!includeComplete) {
        conditions.push(eq(reminders.isComplete, false));
      }

      const results = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(reminders.dueDate))
        : await query.orderBy(desc(reminders.dueDate));

      res.status(200).json(results);
      return;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
      return;
    }
  }

  // Route: PATCH /api/reminders?id=xxx - Update reminder (mark complete, update note/date)
  if (req.method === 'PATCH') {
    try {
      const pathParts = url.pathname.split('/').filter(Boolean);
      const id = url.searchParams.get('id') || pathParts[2];

      if (!id) {
        res.status(400).json({ error: 'Missing required param: id' });
        return;
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const updates: Partial<{ dueDate: string; note: string; isComplete: boolean }> = {};

      if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
      if (body.note !== undefined) updates.note = body.note;
      if (body.isComplete !== undefined) updates.isComplete = body.isComplete;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const result = await db
        .update(reminders)
        .set(updates)
        .where(eq(reminders.id, parseInt(id, 10)))
        .returning();

      if (result.length === 0) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }

      res.status(200).json(result[0]);
      return;
    } catch (error) {
      console.error('Error updating reminder:', error);
      res.status(500).json({ error: 'Failed to update reminder' });
      return;
    }
  }

  // Route: DELETE /api/reminders?id=xxx - Delete reminder
  if (req.method === 'DELETE') {
    try {
      const pathParts = url.pathname.split('/').filter(Boolean);
      const id = url.searchParams.get('id') || pathParts[2];

      if (!id) {
        res.status(400).json({ error: 'Missing required param: id' });
        return;
      }

      await db.delete(reminders).where(eq(reminders.id, parseInt(id, 10)));

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
