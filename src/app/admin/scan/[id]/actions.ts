'use server';

import { createClient } from '@/lib/supabase/server';
import { generateEventCode, getTotpTimeRemaining } from '@/lib/totp';

export interface CheckinCodeResult {
  code: string;
  timeLeft: number;
  type: 'totp' | 'static_otp';
}

/**
 * Server action that generates the current check-in code for an event.
 * Keeps the raw checkin_secret on the server — never sent to the browser.
 */
export async function getCheckinCode(eventId: string): Promise<CheckinCodeResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;

  const { data: event } = await supabase
    .from('events')
    .select('checkin_secret, checkin_type')
    .eq('id', eventId)
    .single();

  if (!event) return null;

  const code = await generateEventCode(event.checkin_secret, event.checkin_type);
  return { code, timeLeft: getTotpTimeRemaining(), type: event.checkin_type };
}
