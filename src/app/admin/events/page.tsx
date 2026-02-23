import { createClient } from '@/lib/supabase/server';
import EventsTable from './events-table';

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // 1. Parse URL Parameters for Pagination and Sorting
  const page = parseInt(params.page as string) || 1;
  const limit = parseInt(params.limit as string) || 10;
  const sortKey = (params.sort as string) || 'start_time';
  const sortOrder = (params.order as string) || 'desc';

  const supabase = await createClient();

  // SECURITY BEST PRACTICE: Verify admin status here or rely on secure Middleware/RLS.
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user || user.role !== 'admin') redirect('/login');

  // 2. Calculate pagination ranges for Supabase
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 3. Fetch data with exact count for pagination
  // Note: Adjust the select query if total_waste and total_participants are relational counts
  const { data: events, count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order(sortKey, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) {
    console.error('Error fetching events:', error);
    return <div className="p-6 text-red-500">Failed to load events.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-200">Manage Events</h1>
      </div>
      
      <EventsTable
        events={events || []}
        totalCount={count || 0}
        currentPage={page}
        currentLimit={limit}
        currentSort={sortKey}
        currentOrder={sortOrder}
      />
    </div>
  );
}