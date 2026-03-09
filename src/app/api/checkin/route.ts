import { createClient } from '@/lib/supabase/server';
import { validateEventCheckin } from '@/lib/totp';
import { signCheckinCookie } from '@/lib/checkin-cookie';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  );
}

async function checkRateLimit(ip: string, supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_ip: ip,
    p_max_requests: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (error) {
    console.error('Rate limit check failed:', error.message);
    return true; // fail open — prefer availability over strict limiting
  }
  return data as boolean;
}

// ─── Shared outcome type ──────────────────────────────────────────────────────

type CheckinOutcome =
  | { type: 'success' }
  | { type: 'already' }
  | { type: 'guest'; cookieValue: string }
  | { type: 'error'; reason: string; httpStatus: number };

async function processCheckin(
  otp: string,
  event_id: string,
  supabase: SupabaseClient,
): Promise<CheckinOutcome> {
  // 1. Get current user (may be null for guests)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch event config
  const { data: event, error } = await supabase
    .from('events')
    .select('checkin_type, checkin_secret')
    .eq('id', event_id)
    .single();

  if (error || !event) {
    return { type: 'error', reason: 'not_found', httpStatus: 404 };
  }

  // 3. Validate OTP
  const validation = await validateEventCheckin(otp, {
    checkin_type: event.checkin_type,
    checkin_secret: event.checkin_secret,
  });

  if (!validation.success) {
    return { type: 'error', reason: 'invalid_code', httpStatus: 400 };
  }

  // 4a. Guest flow — store a signed claim (OTP expires in 30 s, claim lasts 15 min)
  if (!user) {
    const cookieValue = signCheckinCookie({ validated: true, event_id });
    return { type: 'guest', cookieValue };
  }

  // 4b. Logged-in flow — insert participation record
  const { error: insertError } = await supabase
    .from('participation')
    .insert({ user_id: user.id, event_id });

  if (insertError) {
    if (insertError.code === '23505') return { type: 'already' };
    console.error('Participation insert failed:', insertError.message);
    return { type: 'error', reason: 'checkin_failed', httpStatus: 500 };
  }

  // 5. Update last_active (best-effort)
  await supabase
    .from('profiles')
    .update({ last_active: new Date().toISOString() })
    .eq('id', user.id);

  return { type: 'success' };
}

// ─── Cookie helper ────────────────────────────────────────────────────────────

function applyCheckinCookie(response: NextResponse, cookieValue: string): void {
  response.cookies.set('pending_checkin', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes to complete sign-up
    path: '/',
  });
}

// ─── GET — QR code deep-link (browser redirect flow) ─────────────────────────
//
// NOTE: OTP is exposed in the URL (browser history, server logs, referrer headers).
// Accept GET only for QR deep-links; prefer POST for programmatic callers.

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const otp = searchParams.get('otp');
  const event_id = searchParams.get('event_id');

  if (!otp || !event_id || !UUID_REGEX.test(event_id)) {
    return NextResponse.redirect(`${origin}/checkin?status=error&reason=invalid`);
  }

  const supabase = await createClient();
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(ip, supabase);

  if (!allowed) {
    return NextResponse.redirect(`${origin}/checkin?status=error&reason=rate_limited`);
  }

  const outcome = await processCheckin(otp, event_id, supabase);

  if (outcome.type === 'guest') {
    // Redirect to auth and carry a signed cookie so the claim survives sign-up
    const response = NextResponse.redirect(
      `${origin}/auth?message=QR+code+verified!+Sign+in+to+complete+your+check-in.`,
    );
    applyCheckinCookie(response, outcome.cookieValue);
    return response;
  }

  if (outcome.type === 'error') {
    return NextResponse.redirect(
      `${origin}/checkin?status=error&reason=${outcome.reason}`,
    );
  }

  // 'success' | 'already'
  return NextResponse.redirect(`${origin}/checkin?status=${outcome.type}`);
}

// ─── POST — programmatic / client-side callers (JSON response) ───────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const otp = typeof body.otp === 'string' ? body.otp : null;
  const event_id = typeof body.event_id === 'string' ? body.event_id : null;

  if (!otp || !event_id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (!UUID_REGEX.test(event_id)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const supabase = await createClient();
  const ip = getClientIp(req);
  const allowed = await checkRateLimit(ip, supabase);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) } },
    );
  }

  const outcome = await processCheckin(otp, event_id, supabase);

  switch (outcome.type) {
    case 'success':
      return NextResponse.json({ status: 'success', message: 'Check-in Complete!' });

    case 'already':
      return NextResponse.json({ status: 'success', message: 'Already checked in!' });

    case 'guest': {
      const response = NextResponse.json({
        status: 'guest',
        redirectUrl: '/auth?message=QR+code+verified!+Sign+in+to+complete+your+check-in.',
      });
      applyCheckinCookie(response, outcome.cookieValue);
      return response;
    }

    case 'error':
      return NextResponse.json({ error: outcome.reason }, { status: outcome.httpStatus });
  }
}
