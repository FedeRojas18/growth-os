import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activities } from './_lib/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
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
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Route: POST /api/activities - Create activity
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { entityType, entityId, type, content, metadata } = body;

      if (!entityType || !entityId || !type || !content) {
        res.status(400).json({ error: 'Missing required fields: entityType, entityId, type, content' });
        return;
      }

      const result = await db.insert(activities).values({
        entityType,
        entityId,
        type,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      }).returning();

      res.status(201).json(result[0]);
      return;
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({ error: 'Failed to create activity' });
      return;
    }
  }

  // Route: GET /api/activities?entityType=target&entityId=xxx - Get activities for entity
  if (req.method === 'GET') {
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'Missing required params: entityType, entityId' });
        return;
      }

      const results = await db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.entityType, entityType),
            eq(activities.entityId, entityId)
          )
        )
        .orderBy(desc(activities.createdAt));

      // Parse metadata JSON for each activity
      const parsed = results.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      }));

      res.status(200).json(parsed);
      return;
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
      return;
    }
  }

  // Route: DELETE /api/activities?id=xxx - Delete activity
  if (req.method === 'DELETE') {
    try {
      const id = url.searchParams.get('id') || pathParts[2];

      if (!id) {
        res.status(400).json({ error: 'Missing required param: id' });
        return;
      }

      await db.delete(activities).where(eq(activities.id, parseInt(id, 10)));

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({ error: 'Failed to delete activity' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
