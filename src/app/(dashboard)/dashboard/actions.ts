// src/app/(dashboard)/dashboard/actions.ts
import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export interface EventRecord {
  event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: string;
  waste_kg: number;
  is_completed: boolean;
  badge_url: string | null;
}

export interface Badge {
  badge_url: string;
  event_title: string;
}

export interface DashboardData {
  profile: {
    full_name: string;
    is_cert_public: boolean;
    [key: string]: unknown;
  } | null;
  events: EventRecord[];
  stats: {
    count: number;
    totalHours: string;
    badges: Badge[];
  };
}

export async function getVolunteerData(userId: string): Promise<DashboardData> {
  // Fetch outside cache: Supabase server client requires request-scoped cookies
  const supabase = await createClient();

  const [profileRes, participationRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('participation')
      .select(`
        event_id,
        events (
          title, start_time, end_time, location,
          event_type, waste_kg, is_completed, badge_url
        )
      `)
      .eq('user_id', userId),
  ]);

  const events: EventRecord[] = (participationRes.data ?? [])
    .filter((row: any) => row.events)
    .map((row: any) => ({
      event_id: row.event_id,
      title: row.events.title,
      start_time: row.events.start_time,
      end_time: row.events.end_time,
      location: row.events.location,
      event_type: row.events.event_type,
      waste_kg: row.events.waste_kg ?? 0,
      is_completed: row.events.is_completed,
      badge_url: row.events.badge_url ?? null,
    }));

  // Cache only the pure computation, keyed per user
  return unstable_cache(
    async () => {
      const totalHours = events.reduce((acc, e) => {
        const diff = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
        return acc + Math.max(0, diff / 3_600_000);
      }, 0);

      // Deduplicate badges by badge_url (one badge per award type)
      const badges: Badge[] = events
        .filter((e) => e.is_completed && e.badge_url)
        .map((e) => ({ badge_url: e.badge_url!, event_title: e.title }))
        .filter((b, i, arr) => arr.findIndex((x) => x.badge_url === b.badge_url) === i);

      return {
        profile: profileRes.data,
        events,
        stats: { count: events.length, totalHours: totalHours.toFixed(1), badges },
      };
    },
    [`dashboard-stats-${userId}`],
    { revalidate: 86400, tags: [`user-${userId}`] },
  )();
}