'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type EventData = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  location: string;
  event_type: string;
  waste_kg: number; // Update these types based on your actual schema
};

type TableProps = {
  events: EventData[];
  totalCount: number;
  currentPage: number;
  currentLimit: number;
  currentSort: string;
  currentOrder: string;
};

export default function EventsTable({
  events,
  totalCount,
  currentPage,
  currentLimit,
  currentSort,
  currentOrder,
}: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / currentLimit);

  // Helper to update URL params
  const updateQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    // Reset to page 1 if sorting or limits change
    if (name !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (column: string) => {
    const isAsc = currentSort === column && currentOrder === 'asc';
    updateQueryString('sort', column);
    updateQueryString('order', isAsc ? 'desc' : 'asc');
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (currentSort !== column) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="ml-1">{currentOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const Th = ({ label, column }: { label: string; column: string }) => (
    <th 
      onClick={() => handleSort(column)}
      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
    >
      {label} <SortIcon column={column} />
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden w-full">
      {/* Table Controls */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <div className="flex items-center space-x-2">
          <label htmlFor="limit" className="text-sm text-slate-600">Rows per page:</label>
          <select
            id="limit"
            value={currentLimit}
            onChange={(e) => updateQueryString('limit', e.target.value)}
            className="border-slate-300 rounded text-sm py-1 px-2 focus:ring-indigo-500"
          >
            {[10, 50, 100, 200, 500].map(limit => (
              <option key={limit} value={limit}>{limit}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-600">
          Showing {((currentPage - 1) * currentLimit) + 1} to {Math.min(currentPage * currentLimit, totalCount)} of {totalCount} events
        </div>
      </div>

      {/* Table Wrapper for Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
              <Th label="Title" column="title" />
              <Th label="Start" column="start_time" />
              <Th label="End" column="end_time" />
              <Th label="Status" column="is_completed" />
              <Th label="Location" column="location" />
              <Th label="Type" column="event_type" />
              <Th label="Waste" column="waste_kg" />
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {events.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">No events found.</td>
              </tr>
            ) : (
              events.map((event, index) => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {/* Calculated row count */}
                    {(currentPage - 1) * currentLimit + index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{event.title}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{new Date(event.start_time).toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{new Date(event.end_time).toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm">
                    {event.is_completed ? (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Completed</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Open</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{event.location}</td>
                  <td className="px-4 py-4 text-sm text-slate-500 capitalize">{event.event_type}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{event.waste_kg || 0} kg</td>
                  <td className="px-4 py-4 text-sm flex justify-center space-x-3">
                    <Link 
                      href={`/admin/events/${event.id}`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Edit
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link 
                      href={`/admin/scan/${event.id}`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Scan
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center bg-slate-50">
          <button
            onClick={() => updateQueryString('page', String(currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 bg-white"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => updateQueryString('page', String(currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}