import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stateOverrides, activities } from './_lib/db/schema.js';
import { eq, and } from 'drizzle-orm';
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

  // Route: PATCH /api/state-overrides?entityType=target&entityId=xxx - Update state
  if (req.method === 'PATCH') {
    try {
      const entityType = url.searchParams.get('entityType');
      const entityId = url.searchParams.get('entityId');

      if (!entityType || !entityId) {
        res.status(400).json({ error: 'Missing required params: entityType, entityId' });
        return;
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { state, previousState } = body;

      if (!state) {
        res.status(400).json({ error: 'Missing required field: state' });
        return;
      }

      const now = new Date();
      const todayStr = getTodayISO();

      // Check if override exists
      const existing = await db
        .select()
        .from(stateOverrides)
        .where(
          and(
            eq(stateOverrides.entityType, entityType),
            eq(stateOverrides.entityId, entityId)
          )
        )
        .limit(1);

      let result;
      if (existing.length > 0) {
        // Update existing
        result = await db
          .update(stateOverrides)
          .set({
            state,
            lastTouch: todayStr,
            updatedAt: now,
          })
          .where(eq(stateOverrides.id, existing[0].id))
          .returning();
      } else {
        // Insert new
        result = await db.insert(stateOverrides).values({
          entityType,
          entityId,
          state,
          lastTouch: todayStr,
          updatedAt: now,
        }).returning();
      }

      // Log state change as activity
      if (previousState && previousState !== state) {
        await db.insert(activities).values({
          entityType,
          entityId,
          type: 'state_change',
          content: `Moved from ${previousState} to ${state}`,
          metadata: JSON.stringify({ from: previousState, to: state }),
          createdAt: now,
        });
      }

      res.status(200).json(result[0]);
      return;
    } catch (error) {
      console.error('Error updating state:', error);
      res.status(500).json({ error: 'Failed to update state' });
      return;
    }
  }

  // Route: GET /api/state-overrides - Get all state overrides (for merging with markdown)
  if (req.method === 'GET') {
    try {
      const entityType = url.searchParams.get('entityType');

      let results;
      if (entityType) {
        results = await db
          .select()
          .from(stateOverrides)
          .where(eq(stateOverrides.entityType, entityType));
      } else {
        results = await db.select().from(stateOverrides);
      }

      res.status(200).json(results);
      return;
    } catch (error) {
      console.error('Error fetching state overrides:', error);
      res.status(500).json({ error: 'Failed to fetch state overrides' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
