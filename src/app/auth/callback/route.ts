import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { validateEventCheckin } from '@/lib/totp'; // Logic from Step 1
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
        let response = NextResponse.redirect(`${origin}/dashboard`);

        try {
          const { otp, event_id } = JSON.parse(pendingCookie.value);
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Fetch Event Secret (Service Role or RLS permitting)
            const { data: event } = await supabase
              .from('events')
              .select('checkin_type, checkin_secret')
              .eq('id', event_id)
              .single();

            if (event) {
              // Validate OTP
              const validation = await validateEventCheckin(otp, {
                checkin_type: event.checkin_type,
                checkin_secret: event.checkin_secret
              });

              if (validation.success) {
                // Insert Participation
                await supabase.from('participation').insert({
                  user_id: user.id,
                  event_id: event_id
                });
                
                // Update Last Active
                await supabase.from('profiles').update({ 
                  last_active: new Date().toISOString() 
                }).eq('id', user.id);

                // Redirect with message on success
                response = NextResponse.redirect(`${origin}/dashboard?msg=checkin_complete`);
              }
            }
          }
        } catch (e) {
          console.error("Cookie parsing or processing failed", e);
        }
        // Clear the cookie regardless of success to prevent loops
        response.cookies.delete('pending_checkin');
        
        return response;
      }
      // --- END GUEST CHECK-IN LOGIC ---

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?message=Auth failed`);
}