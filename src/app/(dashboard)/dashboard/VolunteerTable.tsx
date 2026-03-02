// src/components/dashboard/VolunteerTable.tsx
'use client';

export default function VolunteerTable({ events }: { events: any[] }) {
  const calculateDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">#</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Event Title</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Date</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Location</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Type</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Waste (kg)</th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event, index) => (
              <tr key={event.event_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                <td className="p-4 text-sm font-semibold text-slate-900">{event.title}</td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(event.start_time).toLocaleDateString('en-GB', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                  })}
                </td>
                <td className="p-4 text-sm text-slate-600">{event.location}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium uppercase">
                    {event.event_type}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-amber-700">
                  {event.waste_kg || 0} kg
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {calculateDuration(event.start_time, event.end_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}