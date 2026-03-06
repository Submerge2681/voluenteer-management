import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyCheckinCookie } from '@/lib/checkin-cookie';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- START GUEST CHECK-IN LOGIC ---
      // 1. Check for pending check-in cookie
      // Note: We use the standard Next.js cookies() API to read, not Supabase wrapper for custom cookies
      const cookieStore = await cookies();
      const pendingCookie = cookieStore.get('pending_checkin');

      if (pendingCookie) {
        // Default to dashboard; updated below based on outcome
        let response = NextResponse.redirect(`${origin}/dashboard`);
        let msg = 'checkin_failed';

        try {
          // Verify the HMAC-signed cookie — no OTP re-validation needed because
          // the OTP was already verified when the cookie was set (it would be
          // expired by the time the user finishes signing up anyway).
          const claim = verifyCheckinCookie(pendingCookie.value);
          const { data: { user } } = await supabase.auth.getUser();

          if (!claim) {
            msg = 'checkin_invalid';
          } else if (user) {
            const { error: insertError } = await supabase
              .from('participation')
              .insert({ user_id: user.id, event_id: claim.event_id });

            if (!insertError) {
              await supabase
                .from('profiles')
                .update({ last_active: new Date().toISOString() })
                .eq('id', user.id);
              msg = 'checkin_complete';
            } else if (insertError.code === '23505') {
              msg = 'already_checked_in';
            }
          }
        } catch (e) {
          console.error('Pending check-in processing failed:', e);
        }

        response = NextResponse.redirect(`${origin}/dashboard?msg=${msg}`);
        // Clear the cookie regardless of outcome to prevent loops
        response.cookies.delete('pending_checkin');
        return response;
      }
      // --- END GUEST CHECK-IN LOGIC ---

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?message=Auth failed`);
}