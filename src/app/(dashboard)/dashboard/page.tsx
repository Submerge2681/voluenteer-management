import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth//login');

  // Fetch Profile & Participation Stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: history } = await supabase
    .from('participation')
    .select('event:events(*)') // Relation join
    .eq('user_id', user.id);
  
  const events = history?.map((h: any) => h.event) || [];
  const hours = events.length * 2; // Assuming 2 hours per event for demo

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Welcome, {profile?.full_name || 'Volunteer'}</h1>
          <p className="text-slate-500">Member since {new Date(profile?.created_at).getFullYear()}</p>
        </div>
        <div className="flex gap-3">
            <Link href="/profile" className="px-4 py-2 border rounded hover:bg-slate-50">Edit Profile</Link>
            {profile?.is_cert_public && (
                <Link href={`/verify/${user.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                    View Public Cert
                </Link>
            )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-slate-500">Events Attended</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-slate-500">Impact Hours</h3>
          <p className="text-4xl font-bold text-emerald-600 mt-2">{hours}</p>
        </div>
      </div>

      {/* Badges / History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Journey</h2>
        {events.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                <p className="text-slate-500">No events yet. <Link href="/events" className="text-indigo-600 underline">Find one!</Link></p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event: any) => (
                    <div key={event.id} className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition">
                        <div className="w-16 h-16 bg-slate-100 rounded-full shrink-0 flex items-center justify-center text-2xl">
                            {/* Placeholder for badge_url */}
                            🏆
                        </div>
                        <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-xs text-slate-500">
                                {new Date(event.start_time).toLocaleDateString()}
                            </p>
                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Completed
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}