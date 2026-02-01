import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
};

function extractHost(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  res.status(200).json({
    hasUrl: Boolean(url),
    hasToken: Boolean(token),
    urlHost: extractHost(url),
    nodeVersion: process.version,
    request: {
      method: req.method,
      url: req.url || null,
      hostHeader: req.headers.host || null,
      xForwardedProto: req.headers['x-forwarded-proto'] || null,
    },
  });
}
