// app/events/[id]/edit/page.tsx   (or wherever your edit page lives)
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Calendar, MapPin, Save } from 'lucide-react';
import { indianLocations } from '@/components/locations';

const sortedLocations = [...indianLocations].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
);

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Only admins can edit events
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

  async function updateEvent(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const title = formData.get('title') as string;
    const start_time = formData.get('start_time') as string;
    const body = formData.get('body') as string;
    const location = (formData.get('location') as string) || 'TBD';
    const is_completed = formData.get('is_completed') === 'on';

    await supabase
      .from('events')
      .update({ title, start_time, body, location, is_completed })
      .eq('id', id);

    redirect(`/events/${id}?success=true`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-900">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
        <a
          href={`/events/${id}`}
          className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
        >
          ← Back to event
        </a>
      </div>

      <form action={updateEvent} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={event.title}
              required
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date &amp; Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="datetime-local"
                  name="start_time"
                  id="start_time"
                  defaultValue={event.start_time?.slice(0, 16)}
                  required
                  className="block w-full pl-11 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Location – now pre-selects current value */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <select
              name="location"
              id="location"
              defaultValue={event.location || ''}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="" disabled>
                Select a location
              </option>

              {sortedLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="body"
              id="body"
              rows={8}
              defaultValue={event.body || ''}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[180px]"
            />
          </div>

          {/* Completed Toggle */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="is_completed"
                name="is_completed"
                type="checkbox"
                defaultChecked={event.is_completed}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="is_completed" className="font-medium text-slate-700">
                Mark as Completed
              </label>
              <p className="text-sm text-slate-500">Event will show as "Completed" for everyone.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-5 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Event Changes
          </button>
        </div>
      </form>
    </div>
  );
}