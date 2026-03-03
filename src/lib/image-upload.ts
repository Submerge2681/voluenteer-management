import sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES =['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function processAndUploadImage(
  file: File,
  supabase: SupabaseClient,
  prefix: string = 'img',
  oldImageUrl?: string | null
): Promise<{ url: string | null; error: string | null }> {
  // 1. Validate Size & Type
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { url: null, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }

  // 2. Delete old image if provided (useful for Edit mode)
  if (oldImageUrl) {
    try {
      const urlObj = new URL(oldImageUrl);
      const oldFilename = urlObj.pathname.split('/').pop();
      if (oldFilename) {
        await supabase.storage.from('event_thumbs').remove([oldFilename]);
      }
    } catch (e) {
      console.error("Failed to parse/delete old image", e);
    }
  }

  // 3. Process image with Sharp
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const processedImageBuffer = await sharp(buffer)
    .resize({ width: 1200, height: 628, fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `${prefix}-${crypto.randomUUID()}.webp`;

  // 4. Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from('event_thumbs')
    .upload(fileName, processedImageBuffer, { 
      upsert: false,
      contentType: 'image/webp'
    });

  if (uploadError) {
    return { url: null, error: `Upload failed: ${uploadError.message}` };
  }

  // 5. Get Public URL
  const { data: urlData } = supabase.storage
    .from('event_thumbs')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}