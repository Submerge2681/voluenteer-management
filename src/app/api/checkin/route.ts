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


async function handleCheckin(otp: string, event_id: string, supabase: SupabaseClient) {
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  // 2. FETCH EVENT CONFIG (Needed for validation)
  // We use a service role check here or ensure RLS allows reading basic event details publicly
  const { data: event, error } = await supabase
    .from('events')
    .select('checkin_type, checkin_secret')
    .eq('id', event_id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // 3. VALIDATE OTP (Common logic for both flows)
  const validation = await validateEventCheckin(otp, {
    checkin_type: event.checkin_type,
    checkin_secret: event.checkin_secret
  });

  if (!validation.success) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  // --- BRANCH A: GUEST FLOW ---
  if (!user) {
    // OTP already validated — store a signed claim rather than the raw OTP.
    // The raw OTP would expire in 30 s, long before the user finishes signing up.
    const cookieValue = signCheckinCookie({ validated: true, event_id });

    const response = NextResponse.json({
      status: 'guest',
      redirectUrl: `/auth?msg=scan_success`
    });

    response.cookies.set('pending_checkin', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes to complete sign-up
      path: '/',
    });

    return response;
  }

  // --- BRANCH B: LOGGED IN USER ---
  
  // 4. Perform Check-in (Insert Participation)
  const { error: insertError } = await supabase
    .from('participation')
    .insert({ user_id: user.id, event_id: event_id });

  if (insertError) {
    // Handle "Already Checked In" 23505 means unique constraint already exists
    if (insertError.code === '23505') { 
      return NextResponse.json({ status: 'success', message: 'Already checked in!' });
    }
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }

  // 5. Update Last Active (Fire and forget, or await)
  await supabase
    .from('profiles')
    .update({ last_active: new Date().toISOString() })
    .eq('id', user.id);

  return NextResponse.json({ status: 'success', message: 'Check-in Complete!' });
}

async function handleRequest(req: NextRequest, otp: string | null, event_id: string | null) {
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
      { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  return handleCheckin(otp, event_id, supabase);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return handleRequest(req, body.otp ?? null, body.event_id ?? null);
}

// Note: GET exposes otp in URL (browser history, server logs, referrer headers).
// Prefer POST where possible. Keep GET only if needed for QR code deep-links.
export async function GET(req: NextRequest) {
  return handleRequest(
    req,
    req.nextUrl.searchParams.get('otp'),
    req.nextUrl.searchParams.get('event_id'),
  );
}