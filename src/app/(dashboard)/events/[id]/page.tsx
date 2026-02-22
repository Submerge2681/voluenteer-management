import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ShareEventButtons from './ShareEventButtons';
import AddToCalendarButton from './AddToCalendarButton';


export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const eventRes = await supabase.from('events').select('*').eq('id', id).single();
  if (eventRes.error || !eventRes.data) notFound();
  const event = eventRes.data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-white p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-12">
        <div className='max-w-3xl'>
          {event.image_url && (
            <img className="" src={event.image_url} alt={`Thumbnail image for ${event.title}`}/>
          )}
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mt-4">
            {event.body || "No description provided."}
          </p>
        </div>
        
        <div>
          <div className='mb-4'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.is_completed ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'
            }`}>
              {event.is_completed ? 'Completed' : 'Open'}
            </span>
          </div>

          <div className="flex sm:justify-between items-center gap-4 max-w-">
            <div className="text-center bg-indigo-50 rounded-lg p-3 min-w-20 max-h-20">
              <div className="text-indigo-600 font-bold text-xl">
                {new Date(event.start_time).getDate()}
              </div>
              <div className="text-indigo-800 text-xs uppercase font-bold">
                {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
              </div>
            </div>

            <div className="flex flex-col text-slate-500 text-sm h-full">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(event.start_time).getFullYear()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span> 
          </div>

          <div className="-mt-4">
            <AddToCalendarButton 
              event={{
                title: event.title,
                description: event.body,
                startTime: event.start_time,
                location:event.location || "TBD"
              }} 
            />
          </div>
          
          <hr className='my-8'></hr>

          <CountdownTimer targetDate={event.start_time} />

          <ShareEventButtons 
            title={event.title}
            startTime={event.start_time}
            location={event.location || "TBD"}
          />

        </div>
      </div>
    </div>
  );
}