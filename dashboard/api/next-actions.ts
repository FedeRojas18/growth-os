import { nextActionOverrides } from './_lib/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const db = getEdgeDb();
  const url = new URL(request.url);

  // Route: PATCH /api/next-actions?entityType=target&entityId=xxx - Update next action
  if (request.method === 'PATCH') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        return Response.json(
          { error: 'Missing required params: entityType, entityId' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { nextAction, dueDate } = body;

      if (!nextAction) {
        return Response.json({ error: 'Missing required field: nextAction' }, { status: 400 });
      }

      // Check if override exists
      const existing = await db
        .select()
        .from(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType),
            eq(nextActionOverrides.entityId, entityId)
          )
        )
        .limit(1);

      let result;
      if (existing.length > 0) {
        // Update existing
        result = await db
          .update(nextActionOverrides)
          .set({
            nextAction,
            dueDate: dueDate || null,
            updatedAt: new Date(),
          })
          .where(eq(nextActionOverrides.id, existing[0].id))
          .returning();
      } else {
        // Insert new
        result = await db.insert(nextActionOverrides).values({
          entityType,
          entityId,
          nextAction,
          dueDate: dueDate || null,
          updatedAt: new Date(),
        }).returning();
      }

      return Response.json(result[0]);
    } catch (error) {
      console.error('Error updating next action:', error);
      return Response.json({ error: 'Failed to update next action' }, { status: 500 });
    }
  }

  // Route: GET /api/next-actions?entityType=target&entityId=xxx - Get next action override
  if (request.method === 'GET') {
    if (!db) {
      return Response.json(null);
    }
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        return Response.json(
          { error: 'Missing required params: entityType, entityId' },
          { status: 400 }
        );
      }

      const result = await db
        .select()
        .from(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType),
            eq(nextActionOverrides.entityId, entityId)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return Response.json(null);
      }

      return Response.json(result[0]);
    } catch (error) {
      console.error('Error fetching next action:', error);
      return Response.json({ error: 'Failed to fetch next action' }, { status: 500 });
    }
  }

  // Route: DELETE /api/next-actions?entityType=target&entityId=xxx - Delete override (revert to markdown)
  if (request.method === 'DELETE') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        return Response.json(
          { error: 'Missing required params: entityType, entityId' },
          { status: 400 }
        );
      }

      await db
        .delete(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType),
            eq(nextActionOverrides.entityId, entityId)
          )
        );

      return Response.json({ success: true });
    } catch (error) {
      console.error('Error deleting next action override:', error);
      return Response.json({ error: 'Failed to delete next action override' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
