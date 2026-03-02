'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import sharp from 'sharp';


const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  // SECURITY FIX: Re-verify admin status inside the action
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

  // ── Image Handling ──
  const { data: currentEvent } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', id)
    .single();
    
  let image_url = currentEvent?.image_url || null;
  const imageFile = formData.get('image') as File | null;

  if (imageFile && imageFile.size > 0) {
    // SECURITY: Validate file size and type
    if (imageFile.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }
    // Delete old image using URL parsing for safety
    if (currentEvent?.image_url) {
      try {
        const urlObj = new URL(currentEvent.image_url);
        const oldFilename = urlObj.pathname.split('/').pop(); // Gets the last segment safely
        if (oldFilename) {
          await supabase.storage.from('event_thumbs').remove([oldFilename]);
        }
      } catch (e) {
        console.error("Failed to parse/delete old image", e);
      }
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Adjust width/height based on your UI needs.
    const processedImageBuffer = await sharp(buffer)
      .resize({
        width: 1200,
        height: 628,
        fit: 'cover', // Crops to cover the exact dimensions
        position: 'center' // Centers the crop focus
      })
      .webp({ quality: 80 }) // Converts to WebP with 80% quality
      .toBuffer();

    // Force .webp extension to prevent MIME sniffing vulnerabilities
    const fileName = `${id}-${crypto.randomUUID()}.webp`;

    // Upload processed buffer instead of raw file
    const { error: uploadError } = await supabase.storage
      .from('event_thumbs')
      .upload(fileName, processedImageBuffer, { 
        upsert: false,
        contentType: 'image/webp' // Crucial when uploading buffers
      });

    if (uploadError) {
        console.error("Supabase Storage Error:", uploadError.message);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('event_thumbs')
      .getPublicUrl(fileName);
    
    image_url = urlData.publicUrl;
  }

  // ── Update DB ──
  const { error: updateError } = await supabase
    .from('events')
    .update({
      title, start_time, end_time, body, location,
      is_completed, waste_kg, event_type, badge_url, image_url,
      place, place_url
    })
    .eq('id', id);

  // ERROR HANDLING FIX: Don't redirect on failure
  if (updateError) {
    console.error(updateError);
    throw new Error("Failed to update event in database.");
  }

  // redirect(`/events/${id}?success=true`);
  redirect(`/admin/events`);
}