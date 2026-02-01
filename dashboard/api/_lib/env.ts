import type { VercelResponse } from '@vercel/node';

export function requireTursoEnv(res: VercelResponse) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    res.status(503).json({ error: 'TURSO env missing' });
    return { ok: false as const };
  }

  return { ok: true as const, url, token };
}
