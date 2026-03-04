import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { AnimatedCounter } from './AnimatedCounter';
import { WasteGrowthChart, TopCitiesChart } from './ImpactCharts';
import { MiniCalendar } from './MiniCalendar';


const supabase = await createClient();

// 1. Fetch Global Stats (Fast, single row)
async function getGlobalStats() {
  const { data } = await supabase.from('global_stats').select('*').single();
  return data;
}

// 2. Fetch Chart Data (Cached for performance)
// Aggregates waste over events and top cities
const getChartData = unstable_cache(
  async () => {
    
    // Fetch last 20 completed events for the waste graph
    const { data: events } = await supabase
      .from('events')
      .select('title, waste_kg, start_time, location, participants')
      .eq('is_completed', true)
      .order('start_time', { ascending: true })
      .limit(50); // Limit to avoid massive payload

    const wasteData = events?.map(e => ({
      name: e.title,
      waste: e.waste_kg || 0
    })) || [];

    const { data: cities } = await supabase.rpc('get_top_cities');

    // Map RPC result to chart format
    const cityData = cities?.map((c: any) => ({
      city: c.city || 'Unknown',
      participants: c.participants || 0
    })) || [];

    return { wasteData, cityData };
  },
  ['landing-charts-data'], 
  { revalidate: 3600 }
);


// 3. Fetch Upcoming Events for Calendar (Fresh data)
async function getUpcomingEvents() {
  const today = new Date().toISOString();
  
  // Fetch events for current window (e.g., next 3 months)
  const { data } = await supabase
    .from('events')
    .select('id, title, start_time')
    .gte('start_time', today)
    .order('start_time', { ascending: true })
    .limit(30);
    
  return data || [];
}

export default async function LandingPage() {
  // Parallel data fetching
  const [stats, chartData, upcomingEvents] = await Promise.all([
    getGlobalStats(),
    getChartData(),
    getUpcomingEvents()
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 font-sans">
      <div>
        {/* Hero Section */}
        <section className="w-7xl py-20 pr-8 text-center bg-white border-b border-slate-200 flex flex-col lg:flex-row justify-end items-end ">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              {process.env.NEXT_PUBLIC_ORG_NAME || "The Checkin App"}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join the movement. We connect local heroes with global environmental challenges to create measurable impact.
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
              <Link 
                href="/auth" 
                className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
              >
                Join the Cause
              </Link>
              <Link 
                href="/events" 
                className="px-8 py-4 bg-white text-slate-700 font-semibold border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm"
              >
                Find Cleanups
              </Link>
            </div>
          </div>
          {/* Calendar Column */}
          <div className="flex flex-col h-full w-md">
              <MiniCalendar events={upcomingEvents} />
          </div>
        </section>

        {/* Animated Counters Section */}
        <section className="w-full max-w-6xl mx-auto px-4 -mt-10 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCounter 
              value={stats?.total_waste || 0} 
              label="Kg Waste Removed" 
              colorClass="text-emerald-600" 
            />
            <AnimatedCounter 
              value={stats?.total_volunteers || 0} 
              label="Volunteers Mobilized" 
              colorClass="text-indigo-600" 
            />
            <AnimatedCounter 
              value={stats?.total_cleanups || 0} 
              label="Cleanups Completed" 
              colorClass="text-blue-600" 
            />
          </div>
        </section>

        {/* Analytics & Calendar Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 pb-20 space-y-8">
          <div className="flex flex-col gap-8">
            
            {/* Charts Column */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-100">
                <WasteGrowthChart data={chartData.wasteData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-100">
                <TopCitiesChart data={chartData.cityData} />
              </div>
            </div>
          </div>
        </section>
      </div>
      <div>
        
      </div>

    </main>
  );
}