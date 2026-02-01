import { reminders } from './_lib/db/schema.js';
import { eq, and, lte, gte, desc } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';

export const config = {
  runtime: 'edge',
};

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function handler(request: Request) {
  const db = getEdgeDb();
  const url = new URL(request.url);

  // Route: POST /api/reminders - Create reminder
  if (request.method === 'POST') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const body = await request.json();
      const { entityType, entityId, dueDate, note } = body;

      if (!entityType || !entityId || !dueDate || !note) {
        return Response.json(
          { error: 'Missing required fields: entityType, entityId, dueDate, note' },
          { status: 400 }
        );
      }

      const result = await db.insert(reminders).values({
        entityType,
        entityId,
        dueDate,
        note,
        isComplete: false,
        createdAt: new Date(),
      }).returning();

      return Response.json(result[0], { status: 201 });
    } catch (error) {
      console.error('Error creating reminder:', error);
      return Response.json({ error: 'Failed to create reminder' }, { status: 500 });
    }
  }

  // Route: GET /api/reminders - Get all reminders (optionally filtered)
  // Query params: today=true (only today's), entityType, entityId
  if (request.method === 'GET') {
    if (!db) {
      return Response.json([]);
    }
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

      return Response.json(results);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return Response.json({ error: 'Failed to fetch reminders' }, { status: 500 });
    }
  }

  // Route: PATCH /api/reminders?id=xxx - Update reminder (mark complete, update note/date)
  if (request.method === 'PATCH') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const id = url.searchParams.get('id');

      if (!id) {
        return Response.json({ error: 'Missing required param: id' }, { status: 400 });
      }

      const body = await request.json();
      const updates: Partial<{ dueDate: string; note: string; isComplete: boolean }> = {};

      if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
      if (body.note !== undefined) updates.note = body.note;
      if (body.isComplete !== undefined) updates.isComplete = body.isComplete;

      if (Object.keys(updates).length === 0) {
        return Response.json({ error: 'No fields to update' }, { status: 400 });
      }

      const result = await db
        .update(reminders)
        .set(updates)
        .where(eq(reminders.id, parseInt(id, 10)))
        .returning();

      if (result.length === 0) {
        return Response.json({ error: 'Reminder not found' }, { status: 404 });
      }

      return Response.json(result[0]);
    } catch (error) {
      console.error('Error updating reminder:', error);
      return Response.json({ error: 'Failed to update reminder' }, { status: 500 });
    }
  }

  // Route: DELETE /api/reminders?id=xxx - Delete reminder
  if (request.method === 'DELETE') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const id = url.searchParams.get('id');

      if (!id) {
        return Response.json({ error: 'Missing required param: id' }, { status: 400 });
      }

      await db.delete(reminders).where(eq(reminders.id, parseInt(id, 10)));

      return Response.json({ success: true });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return Response.json({ error: 'Failed to delete reminder' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
