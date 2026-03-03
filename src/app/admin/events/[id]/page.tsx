import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { indianLocations } from '@/components/locations';
import { updateEvent } from './actions';
import EventForm from '@/components/admin/EventForm'; 

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) redirect(`/events/${id}`);

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!event) notFound();

  const { data: badges } = await supabase
    .from('badges')
    .select('name, url')
    .order('name', { ascending: true });

  const sortedLocations =[...indianLocations].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  // Bind the ID to the server action
  const updateEventWithId = updateEvent.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-900">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
        <a href={`/admin/events`} className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1">
          &larr; Back to events
        </a>
      </div>

      <EventForm 
        mode="edit" 
        initialData={event} 
        locations={sortedLocations} 
        badges={badges ||[]} 
        onSubmitAction={updateEventWithId}
      />
    </div>
  );
}