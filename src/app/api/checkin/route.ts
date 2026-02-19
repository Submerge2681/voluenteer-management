import { createClient } from '@/lib/supabase/server';
import { validateEventCheckin } from '@/lib/totp';
import { NextRequest, NextResponse } from 'next/server';

async function handleCheckin(otp: string, event_id: string, supabase: any) {
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  console.log(otp);
  console.log(event_id);

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
    // Store valid scan data in a secure, httpOnly cookie
    const response = NextResponse.json({ 
      status: 'guest', 
      redirectUrl: `/auth/register?msg=scan_success` 
    });

    response.cookies.set('pending_checkin', JSON.stringify({ otp, event_id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 15, // 15 minutes to register
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

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { otp, event_id } = await req.json();

  if (!otp || !event_id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  return handleCheckin(otp, event_id, supabase);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const otp = req.nextUrl.searchParams.get('otp');
  const event_id = req.nextUrl.searchParams.get('event_id');
  console.log(otp)
  console.log(event_id)

  if (!otp || !event_id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  return handleCheckin(otp, event_id, supabase);
}