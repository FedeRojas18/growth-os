import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

export function getEdgeDb(url?: string, authToken?: string) {
  const resolvedUrl = url || process.env.TURSO_DATABASE_URL;
  const resolvedToken = authToken || process.env.TURSO_AUTH_TOKEN;
  if (!resolvedUrl || !resolvedToken) return null;

  const client = createClient({
    url: resolvedUrl,
    authToken: resolvedToken,
  });

  return drizzle(client, { schema });
}
