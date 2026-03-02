import { createClient } from '@/lib/supabase/server';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 300; // Cache for 5 mins

export default async function EventsList() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Events</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id} className="flex flex-col bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="aspect-[1.91/1] w-full overflow-hidden">
              <img
                src={event.image_url || "/images/placeholder.png"}
                alt="Event image"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="py-2 flex-1">
              <h2 className="text-xl font-bold text-slate-900 px-4">{event.title}</h2>
                <div className="flex justify-between items-start px-4 py-2">
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 " />
                        <span>{ event.location ? event.location : "TBD Location" }</span> 
                    </div>
                    {event.is_completed ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">Completed</span>
                    ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Open</span>
                    )}
                </div>
                <div className="flex gap-3">
                  <div className="bg-indigo-600 text-white p-6 flex flex-col items-center justify-center max-w-27.5 shrink-0">
                    <span className="text-2xl font-bold">
                      {new Date(event.start_time).getDate()}
                    </span>
                    <span className="text-sm uppercase tracking-wide">
                      {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  <p className="text-slate-600 line-clamp-2">
                    {event.body || 'Join us for this event...'}
                  </p>
                </div>
            </div>

            <div className="flex items-center bg-slate-50 border-l px-4 py-2 justify-between">
                <div className="text-indigo-600 font-medium hover:underline">
                    View Details &rarr;
                </div>
                {event.badge_url ? (
                  <img
                    className="max-h-12.5"
                    src={event.badge_url}
                    alt={`Badge for ${event.title}`}
                  />
                ) : (
                <div className="max-h-12.5 h-12.5"></div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}