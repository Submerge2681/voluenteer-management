import { createClient } from '@/lib/supabase/server';
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
      <h1 className="text-3xl font-bold mb-8">Upcoming Opportunities</h1>
      
      <div className="grid gap-6">
        {events?.map((event) => (
          <div key={event.id} className="flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="bg-indigo-600 text-white p-6 flex flex-col items-center justify-center min-w-[150px]">
                <span className="text-3xl font-bold">{new Date(event.start_time).getDate()}</span>
                <span className="text-sm uppercase tracking-wide">{new Date(event.start_time).toLocaleString('default', { month: 'short' })}</span>
            </div>
            
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
                    {event.is_completed ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">Completed</span>
                    ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Open</span>
                    )}
                </div>
                <p className="text-slate-600 mt-2 line-clamp-2">{event.body || 'Join us for this event...'}</p>
            </div>

            <div className="p-6 flex items-center bg-slate-50 border-l">
                {/* NOTE: In a real app, this button logic would check 'participation' 
                  to see if user already joined. 
                */}
                <Link href={`/events/${event.id}`} className="text-indigo-600 font-medium hover:underline">
                    View Details &rarr;
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}