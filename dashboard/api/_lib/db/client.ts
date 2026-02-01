import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

export function getEdgeDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return drizzle(client);
}
