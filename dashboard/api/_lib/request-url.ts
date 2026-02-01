import type { VercelRequest } from '@vercel/node';

function readHeader(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getRequestUrl(req: VercelRequest): URL {
  const proto = readHeader(req, 'x-forwarded-proto') || 'https';
  const host = readHeader(req, 'x-forwarded-host') || readHeader(req, 'host') || 'localhost';
  const rawUrl = req.url || '/';
  return new URL(rawUrl, `${proto}://${host}`);
}
