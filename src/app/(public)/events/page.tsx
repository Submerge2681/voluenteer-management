import { createClient } from '@/lib/supabase/server';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { EventsFilter } from './Eventsfilter';

const PAGE_SIZE = 9;

interface SearchParams {
  status?: string;
  type?: string | string[];
  location?: string | string[];
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/** Builds a URL preserving all active filters with a new page number. */
function pageHref(
  page: number,
  status: string,
  types: string[],
  locations: string[],
): string {
  const sp = new URLSearchParams();
  if (status !== 'Upcoming') sp.set('status', status);
  types.forEach((t) => sp.append('type', t));
  locations.forEach((l) => sp.append('location', l));
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '?';
}


function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}

export default async function EventsList({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = params.status ?? 'Upcoming';
  const types = params.type
    ? Array.isArray(params.type)
      ? params.type
      : [params.type]
    : [];
  const locations = params.location
    ? Array.isArray(params.location)
      ? params.location
      : [params.location]
    : [];

  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('is_completed', status === 'completed')
    .order('start_time', { ascending: true })
    .range(from, to);

  if (types.length > 0) query = query.in('event_type', types);
  if (locations.length > 0) query = query.in('location', locations);

  const { data: events, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  // Clamp current page in case filters changed and page is now out of range
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold">Events</h1>

        <Suspense
          fallback={
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-slate-400">
              Filter
            </div>
          }
        >
          <EventsFilter />
        </Suspense>
      </div>

      {events && events.length === 0 && (
        <p className="text-slate-500 text-sm">No events match the current filters.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Link
            href={`/events/${event.id}`}
            key={event.id}
            className="flex flex-col bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
          >
            <div className="aspect-[1.91/1] w-full overflow-hidden">
              <img
                src={event.image_url || '/images/placeholder.png'}
                alt="Event image"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="py-2 flex-1">
              <h2 className="text-xl font-bold text-slate-900 px-4">{event.title}</h2>
              <div className="flex justify-between items-start px-4 py-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location ?? 'TBD Location'}</span>
                </div>
                {event.is_completed ? (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    Completed
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Upcoming
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <div className="bg-indigo-600 text-white p-6 flex flex-col items-center justify-center max-w-20 max-h-20 shrink-0">
                  <span className="text-sm uppercase tracking-wide">
                    {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold">
                    {new Date(event.start_time).getDate()}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-4">
                  {event.body || 'Join us for this event...'}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-50 px-4 py-2 justify-between">
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
                <div className="max-h-12.5 h-12.5" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-1.5 mt-10"
          aria-label="Pagination"
        >
          <PaginationLink
            href={pageHref(safePage - 1, status, types, locations)}
            disabled={safePage === 1}
          >
            ← Prev
          </PaginationLink>

          {pageRange(safePage, totalPages).map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 py-1.5 text-sm text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <PaginationLink
                key={p}
                href={pageHref(p, status, types, locations)}
                active={p === safePage}
                aria-current={p === safePage ? 'page' : undefined}
              >
                {p}
              </PaginationLink>
            ),
          )}

          <PaginationLink
            href={pageHref(safePage + 1, status, types, locations)}
            disabled={safePage === totalPages}
          >
            Next →
          </PaginationLink>
        </nav>
      )}

      {count != null && count > 0 && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Showing {from + 1}–{Math.min(to + 1, count)} of {count} events
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component — keeps JSX above readable
// ---------------------------------------------------------------------------

interface PaginationLinkProps {
  href: string;
  disabled?: boolean;
  active?: boolean;
  'aria-current'?: 'page' | undefined;
  children: React.ReactNode;
}

function PaginationLink({
  href,
  disabled,
  active,
  children,
  ...rest
}: PaginationLinkProps) {
  const base =
    'px-3 py-1.5 rounded border text-sm font-medium transition select-none';
  const styles = disabled
    ? `${base} pointer-events-none text-slate-300 border-slate-200`
    : active
      ? `${base} bg-indigo-600 text-white border-indigo-600`
      : `${base} text-slate-600 border-slate-300 hover:bg-slate-50`;

  return (
    <Link href={href} aria-disabled={disabled} className={styles} {...rest}>
      {children}
    </Link>
  );
}