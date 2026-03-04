import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getVolunteerData, type Badge } from './actions';
import VolunteerTable from './VolunteerTable';
import Image from 'next/image';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { profile, events, stats } = await getVolunteerData(user.id);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {profile?.full_name}</p>
        </div>

        {profile?.is_cert_public && (
          <div className="flex gap-3 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 shadow-sm">
            <Link href={`/verify/${user.id}`} className="btn-secondary">View Certificate</Link>
          </div>
        )}
      </header>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Events Participated" value={stats.count} color="text-indigo-600" />
        <StatCard label="Total Impact Hours" value={`${stats.totalHours} hrs`} color="text-emerald-600" />
        <BadgesCard badges={stats.badges} />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Participation History</h2>
        <VolunteerTable events={events} />
      </section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function BadgesCard({ badges }: { badges: Badge[] }) {
  return (
    <div className="md:col-span-2 bg-slate-100 p-6 rounded-xl">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
        Badges Earned
      </p>

      {badges.length === 0 ? (
        <p className="text-slate-400 text-sm">Complete events to earn badges.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {badges.map((badge) => (
            <div
              key={badge.badge_url}
              className="group relative flex flex-col items-center gap-1"
              title={badge.event_title}
            >
              <div className="relative w-14 h-14 overflow-hidden hover:scale-105 transition-colors">
                <Image
                  src={badge.badge_url}
                  alt={`Badge for ${badge.event_title}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              {/* Tooltip on hover */}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-slate-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {badge.event_title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}