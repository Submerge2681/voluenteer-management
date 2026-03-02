'use server'

import { createClient } from '@/lib/supabase/server';
import { generateEventSecret } from '@/lib/totp'; // Reusing our helper
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify Admin Status (Double-check for security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }

  // 2. Extract Data
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const location = formData.get('location') as string;
  const startTime = formData.get('start_time') as string;
  const type = formData.get('checkin_type') as 'totp' | 'static_otp';
  
  // 3. Generate Secret logic
  // If Static: Use provided pin OR generate 6-digit. If TOTP: Generate Secret.
  let secret = formData.get('static_pin') as string;
  
  if (type === 'totp' || !secret) {
     secret = generateEventSecret(type);
  }

  // 4. Insert Event
  const { error } = await supabase.from('events').insert({
    title,
    body,
    start_time: new Date(startTime).toISOString(),
    location,
    checkin_type: type,
    checkin_secret: secret,
    is_completed: false,
    badge_url: 'https://placehold.co/400x400/indigo/white?text=Badge', // Default or replace with storage URL
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events'); // Update public list
  revalidatePath('/admin/events'); // Update admin list
  return { error: null };
}