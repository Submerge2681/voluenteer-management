import { createHmac } from 'crypto';

export interface PendingCheckin {
  validated: true;
  event_id: string;
}

const secret = process.env.CHECKIN_COOKIE_SECRET ?? 'dev-insecure-fallback';

export function signCheckinCookie(payload: PendingCheckin): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString('base64url');
  const sig = createHmac('sha256', secret).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

export function verifyCheckinCookie(value: string): PendingCheckin | null {
  const dot = value.lastIndexOf('.');
  if (dot === -1) return null;

  const encoded = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(encoded).digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (sig.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (payload?.validated !== true || typeof payload?.event_id !== 'string') return null;
    return payload as PendingCheckin;
  } catch {
    return null;
  }
}
