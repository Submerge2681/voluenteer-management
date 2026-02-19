import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Use admin client here

export async function GET(req: NextRequest) {
  // 1. Security: Verify Vercel Cron Header
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Initialize Service Role Client (Bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Heavy Calculation (Done only once per day)
  // Count total volunteers (profiles)
  const { count: volCount, error: volError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (volError) return NextResponse.json({ error: volError.message }, { status: 500 });

  // Count total participation events (cleanup)
  const { count: cleanupCount, error: cleanupError } = await supabase
    .from('participation')
    .select('*', { count: 'exact', head: true });

  if (cleanupError) return NextResponse.json({ error: cleanupError.message }, { status: 500 });

  // 4. Update the cached "Global Stats" row (ID: 1)
  const { error: updateError } = await supabase
    .from('global_stats')
    .update({ 
      total_volunteers: volCount, 
      total_cleanups: cleanupCount,
      last_updated: new Date().toISOString()
    })
    .eq('id', 1);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ success: true, volCount, cleanupCount });
}