'use client';

import { CalendarPlus } from 'lucide-react';

interface EventData {
  title: string;
  description: string;
  startTime: string; // ISO String
  location?: string;
}

export default function AddToCalendarButton({ event }: { event: EventData }) {
  
  const handleGoogleCalendar = () => {
    const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    // Assuming 1 hour duration if not specified
    const end = new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${start}/${end}`);
    url.searchParams.append('details', event.description);
    if (event.location) url.searchParams.append('location', event.location);

    window.open(url.toString(), '_blank');
  };

  return (
    <button
      onClick={handleGoogleCalendar}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
    >
      <CalendarPlus className="w-4 h-4 text-indigo-600" />
      Add to Google Calendar
    </button>
  );
}