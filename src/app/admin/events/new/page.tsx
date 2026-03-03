import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { indianLocations } from '@/components/locations';
import { createEvent } from './actions';
import EventForm from '@/components/admin/EventForm';

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/events'); 
  }

  const { data: badges } = await supabase
    .from('badges')
    .select('name, url')
    .order('name', { ascending: true });

  const sortedLocations = [...indianLocations].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
        <a href="/admin/events" className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1">
          &larr; Back to events
        </a>
      </div>
      
      <EventForm 
        mode="create" 
        locations={sortedLocations} 
        badges={badges ||[]} 
        onSubmitAction={createEvent} 
      />
    </div>
  );
}