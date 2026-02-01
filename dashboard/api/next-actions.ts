import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nextActionOverrides } from './_lib/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client.js';
import { getRequestUrl } from './_lib/request-url.js';
import { requireTursoEnv } from './_lib/env.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = requireTursoEnv(res);
  if (!env.ok) return;
  const db = getEdgeDb(env.url, env.token);
  if (!db) {
    res.status(503).json({ error: 'TURSO env missing' });
    return;
  }
  const url = getRequestUrl(req);

  // Route: PATCH /api/next-actions?entityType=target&entityId=xxx - Update next action
  if (req.method === 'PATCH') {
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'Missing required params: entityType, entityId' });
        return;
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { nextAction, dueDate } = body;

      if (!nextAction) {
        res.status(400).json({ error: 'Missing required field: nextAction' });
        return;
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

      res.status(200).json(result[0]);
      return;
    } catch (error) {
      console.error('Error updating next action:', error);
      res.status(500).json({ error: 'Failed to update next action' });
      return;
    }
  }

  // Route: GET /api/next-actions?entityType=target&entityId=xxx - Get next action override
  if (req.method === 'GET') {
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'Missing required params: entityType, entityId' });
        return;
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
        res.status(200).json(null);
        return;
      }

      res.status(200).json(result[0]);
      return;
    } catch (error) {
      console.error('Error fetching next action:', error);
      res.status(500).json({ error: 'Failed to fetch next action' });
      return;
    }
  }

  // Route: DELETE /api/next-actions?entityType=target&entityId=xxx - Delete override (revert to markdown)
  if (req.method === 'DELETE') {
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'Missing required params: entityType, entityId' });
        return;
      }

      await db
        .delete(nextActionOverrides)
        .where(
          and(
            eq(nextActionOverrides.entityType, entityType),
            eq(nextActionOverrides.entityId, entityId)
          )
        );

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error('Error deleting next action override:', error);
      res.status(500).json({ error: 'Failed to delete next action override' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
