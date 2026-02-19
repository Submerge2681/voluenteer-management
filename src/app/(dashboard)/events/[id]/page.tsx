import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import AddToCalendarButton from '@/components/events/AddToCalendarButton';
import AdminCheckinManager from '@/components/events/AdminCheckinManager';

// ISR: Cache event details for 5 minutes
// export const revalidate = 300;

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.is_completed ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'
            }`}>
              {event.is_completed ? 'Completed' : 'Open for Registration'}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{event.title}</h1>
          </div>
           {/* Date Badge */}
          <div className="text-center bg-indigo-50 rounded-lg p-3 min-w-[80px]">
            <div className="text-indigo-600 font-bold text-xl">
              {new Date(event.start_time).getDate()}
            </div>
            <div className="text-indigo-800 text-xs uppercase font-bold">
              {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(event.start_time).getFullYear()}
          </div>
          {/* Placeholder for location if added to schema later */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>TBD Location</span> 
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">About this Event</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {event.body || "No description provided."}
          </p>
        </div>

        <div className="mt-8">
          <AddToCalendarButton 
            event={{
              title: event.title,
              description: event.body,
              startTime: event.start_time,
              location: "TBD"
            }} 
          />
        </div>
      </div>

      {/* Admin Zone: QR & TOTP Manager */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl overflow-hidden relative">
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

            <AdminCheckinManager 
              eventId={event.id}
              secret={event.checkin_secret}
              type={event.checkin_type}
            />
          </div>
        </div>
      )}
    </div>
  );
}