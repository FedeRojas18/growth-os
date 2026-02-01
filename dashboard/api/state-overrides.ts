import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { stateOverrides, activities } from './_lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default async function handler(request: Request) {
  const db = getDb();
  const url = new URL(request.url);

  // Route: PATCH /api/state-overrides?entityType=target&entityId=xxx - Update state
  if (request.method === 'PATCH') {
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
      const { state, previousState } = body;

      if (!state) {
        return Response.json({ error: 'Missing required field: state' }, { status: 400 });
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

      return Response.json(result[0]);
    } catch (error) {
      console.error('Error updating state:', error);
      return Response.json({ error: 'Failed to update state' }, { status: 500 });
    }
  }

  // Route: GET /api/state-overrides - Get all state overrides (for merging with markdown)
  if (request.method === 'GET') {
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

      return Response.json(results);
    } catch (error) {
      console.error('Error fetching state overrides:', error);
      return Response.json({ error: 'Failed to fetch state overrides' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
