'use server';

import { createClient } from '@/lib/supabase/server';
import { generateEventSecret } from '@/lib/totp';
import { processAndUploadImage } from '@/lib/image-upload';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

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

  const title = formData.get('title') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const body = formData.get('body') as string;
  const location = formData.get('location') as string;
  const event_type = formData.get('event_type') as string;
  const place = formData.get('place') as string;
  const place_url = formData.get('place_url') as string;
  const badge_url = formData.get('badge_url') as string;
  const type = formData.get('checkin_type') as 'totp' | 'static_otp';
  const is_completed = formData.get('is_completed') === 'on';

  let waste_kg: number | null = null;
  if (is_completed) {
    const wasteStr = formData.get('waste_kg') as string;
    waste_kg = wasteStr ? parseFloat(wasteStr) : 0;
  }
  
  // Generating Checkin Secret
  let secret = formData.get('static_pin') as string;
  if (type === 'totp' || !secret) {
     secret = generateEventSecret(type);
  }

  // Handle Image Upload using Shared Utility
  let image_url = null;
  const imageFile = formData.get('image') as File | null;

  if (imageFile && imageFile.size > 0) {
    const { url, error } = await processAndUploadImage(imageFile, supabase, 'new');
    
    if (error) return { error };
    image_url = url;
  }

  // Insert Database Record
  const { error } = await supabase.from('events').insert({
    title, body, start_time: new Date(start_time).toISOString(), end_time: new Date(end_time).toISOString(), 
    location, event_type, place, place_url,
    badge_url: badge_url,
    image_url, is_completed, waste_kg, checkin_type: type, checkin_secret: secret
  });

  if (error) return { error: error.message };

  revalidatePath('/events');
  revalidatePath('/admin/events');
  redirect('/admin/events');
}