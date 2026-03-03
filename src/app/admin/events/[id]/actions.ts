'use server';

import { createClient } from '@/lib/supabase/server';
import { processAndUploadImage } from '@/lib/image-upload';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    throw new Error("Forbidden: Admin access required.");
  }

  const title = formData.get('title') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const body = formData.get('body') as string;
  const location = (formData.get('location') as string) || 'TBD';
  const is_completed = formData.get('is_completed') === 'on';
  const event_type = formData.get('event_type') as string;
  const badge_url = formData.get('badge_url') as string;
  const place = formData.get('place') as string;
  const place_url = formData.get('place_url') as string;

  let waste_kg: number | null = null;
  if (is_completed) {
    const wasteStr = formData.get('waste_kg') as string;
    waste_kg = wasteStr ? parseFloat(wasteStr) : 0;
  }

  const { data: currentEvent } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', id)
    .single();
    
  let image_url = currentEvent?.image_url || null;
  const imageFile = formData.get('image') as File | null;

  // Handle Image Upload using Shared Utility
  if (imageFile && imageFile.size > 0) {
    const { url, error } = await processAndUploadImage(
      imageFile, 
      supabase, 
      id, 
      currentEvent?.image_url // Automatically handles old image deletion
    );
    
    if (error) return { error };
    image_url = url;
  }

  const { error: updateError } = await supabase
    .from('events')
    .update({
      title, start_time: new Date(start_time).toISOString(), end_time: new Date(end_time).toISOString(),
      body, location, is_completed, waste_kg, event_type, badge_url, image_url, place, place_url
    })
    .eq('id', id);

  if (updateError) {
    console.error(updateError);
    return { error: "Failed to update event in database. " + updateError.message };
  }

  revalidatePath('/events'); 
  revalidatePath('/admin/events'); 
  redirect(`/admin/events`);
}