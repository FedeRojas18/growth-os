import { getEdgeDb } from './_lib/db/client.js';
import { stateOverrides } from './_lib/db/schema.js';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const hasDbUrl = !!process.env.TURSO_DATABASE_URL;
  const hasAuthToken = !!process.env.TURSO_AUTH_TOKEN;

  let dbConnected = false;
  let dbError: string | null = null;

  if (hasDbUrl) {
    try {
      const db = getEdgeDb();
      if (db) {
        // Simple query to verify connection
        await db.select().from(stateOverrides).limit(1);
        dbConnected = true;
      }
    } catch (err) {
      dbError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      urlConfigured: hasDbUrl,
      tokenConfigured: hasAuthToken,
      connected: dbConnected,
      error: dbError,
    },
  });
}
