import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// ISR Strategy: Revalidate at most once every hour
export const revalidate = 3600; 

export default async function LandingPage() {
  const supabase = await createClient();

  // Fetch the optimized stats row (Single row read)
  const { data: stats } = await supabase
    .from('global_stats')
    .select('*')
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          {process.env.NEXT_PUBLIC_ORG_NAME}
        </h1>
        <p className="text-xl text-slate-600">
          Mobilizing volunteers for a better future.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-4xl font-bold text-indigo-600">
              {stats?.total_volunteers || 0}
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">
              Volunteers
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-4xl font-bold text-emerald-600">
              {stats?.total_impact_hours || 0}
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">
              Impact Hours
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/auth//login" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Volunteer Login
          </Link>
          <Link 
            href="/events" 
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </main>
  );
}