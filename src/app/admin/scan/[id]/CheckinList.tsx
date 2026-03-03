import { createClient } from '@/lib/supabase/server';

interface Props {
  eventId: string;
}

export default async function CheckinList({ eventId }: Props) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('checkin_list')
    .select('full_name')
    .eq('event_id', eventId)
    .order('full_name');

  if (error) return null;

  return (
    <div className="mt-6 md:mt-0 md:ml-8 min-w-55 border-l border-slate-800 pl-8">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Checked In ({data.length})
      </h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm">No check-ins yet.</p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.map((row, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
              <span>{i+1}.</span>
              {row.full_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}