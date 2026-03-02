import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// 1. Define the shape of our data
export interface EventRecord {
  event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: string;
  waste_kg: number;
  is_completed: boolean;
}

// This function handles the logic/calculation and is cached
const getCachedStats = unstable_cache(
  async (events: EventRecord[], profile: any) => {
    const totalHours = events.reduce((acc, event) => {
      const start = new Date(event.start_time).getTime();
      const end = new Date(event.end_time).getTime();
      const diff = (end - start) / (1000 * 60 * 60);
      return acc + (diff > 0 ? diff : 0);
    }, 0);

    return {
      profile,
      events,
      stats: {
        count: events.length,
        totalHours: totalHours.toFixed(1),
        totalWaste: events.reduce((acc, e) => acc + (Number(e.waste_kg) || 0), 0).toFixed(1)
      }
    };
  },
  ['dashboard-stats-key'], // base key
  { revalidate: 3600 * 24 } // 24 hours
);

// This wrapper is what your Page calls
export const getVolunteerData = async (userId: string, supabase: any) => {
  // 1. Fetch dynamic data OUTSIDE the cache
  const [profileReq, historyReq] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('volunteer_history').select('*').eq('user_id', userId)
  ]);

  const events = (historyReq.data as EventRecord[]) || [];
  const profile = profileReq.data;

  // 2. Pass data into the cache (the cache key includes userId for uniqueness)
  // We use the userId as part of the key to ensure users don't see each other's data
  return getCachedStats(events, profile);
};