import { activities } from './_lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getEdgeDb } from './_lib/db/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const db = getEdgeDb();
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Route: POST /api/activities - Create activity
  if (request.method === 'POST') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const body = await request.json();
      const { entityType, entityId, type, content, metadata } = body;

      if (!entityType || !entityId || !type || !content) {
        return Response.json(
          { error: 'Missing required fields: entityType, entityId, type, content' },
          { status: 400 }
        );
      }

      const result = await db.insert(activities).values({
        entityType,
        entityId,
        type,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      }).returning();

      return Response.json(result[0], { status: 201 });
    } catch (error) {
      console.error('Error creating activity:', error);
      return Response.json({ error: 'Failed to create activity' }, { status: 500 });
    }
  }

  // Route: GET /api/activities?entityType=target&entityId=xxx - Get activities for entity
  if (request.method === 'GET') {
    if (!db) {
      return Response.json([]);
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

      return Response.json(parsed);
    } catch (error) {
      console.error('Error fetching activities:', error);
      return Response.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
  }

  // Route: DELETE /api/activities?id=xxx - Delete activity
  if (request.method === 'DELETE') {
    if (!db) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }
    try {
      const id = url.searchParams.get('id');

      if (!id) {
        return Response.json({ error: 'Missing required param: id' }, { status: 400 });
      }

      await db.delete(activities).where(eq(activities.id, parseInt(id, 10)));

      return Response.json({ success: true });
    } catch (error) {
      console.error('Error deleting activity:', error);
      return Response.json({ error: 'Failed to delete activity' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
