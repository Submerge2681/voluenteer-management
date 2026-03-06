import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import AdminCheckinManager from './AdminCheckinManager';
import CheckinList from './CheckinList';

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (!user) {
    return redirect('/')
  }
  else {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = data?.role === "admin" || data?.role === "super_admin";
  }

  const eventRes = await supabase.from('events').select('*').eq('id', id).single();

  if (eventRes.error || !eventRes.data) notFound();
  
  const event = eventRes.data;

  return (
    <>
      {/* Admin Zone: QR & TOTP Manager */}
      {isAdmin && (
        <div className='flex justify-center'>
          <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl overflow-hidden relative w-6xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertCircle className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-indigo-500 w-2 h-2 rounded-full animate-pulse"/>
                  Admin Control Center
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Only visible to admins. Use this to check in volunteers.
                </p>
              </div>

              <div className='flex flex-col md:flex-row'>
                <AdminCheckinManager
                  eventId={event.id}
                />

                <CheckinList eventId={event.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}