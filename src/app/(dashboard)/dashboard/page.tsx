// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getVolunteerData } from './actions';
import VolunteerTable from './VolunteerTable';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { profile, events, stats } = await getVolunteerData(user.id, supabase);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {profile?.full_name}</p>
        </div>
        <div className="flex gap-3">
          {profile?.is_cert_public && (
            <Link href={`/verify/${user.id}`} className="btn-secondary">View Certificate</Link>
          )}
        </div>
      </header>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Events Participated" value={stats.count} color="text-indigo-600" />
        <StatCard label="Total Impact Hours" value={`${stats.totalHours} hrs`} color="text-emerald-600" />
        <StatCard label="Waste Collected" value={`${stats.totalWaste} kg`} color="text-amber-600" />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Participation History</h2>
        <VolunteerTable events={events} />
      </section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  );
}