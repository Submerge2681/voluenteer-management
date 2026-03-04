'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { indianLocations } from '@/components/locations';
import { eventTypes, type EventType } from '@/components/eventTypes';


export function EventsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Reset loading state once Next.js completes navigation (searchParams update)
  useEffect(() => {
    setIsPending(false);
  }, [searchParams]);

  const status = searchParams.get('status') ?? 'ongoing';
  const types = searchParams.getAll('type') as EventType[];
  const locations = searchParams.getAll('location');

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const buildUrl = useCallback(
    (updates: Partial<{ status: string; type: string[]; location: string[] }>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.status !== undefined) params.set('status', updates.status);
      if (updates.type !== undefined) {
        params.delete('type');
        updates.type.forEach((t) => params.append('type', t));
      }
      if (updates.location !== undefined) {
        params.delete('location');
        updates.location.forEach((l) => params.append('location', l));
      }
      return `${pathname}?${params.toString()}`;
    },
    [searchParams, pathname],
  );

  const navigate = useCallback(
    (url: string) => {
      setIsPending(true);
      router.push(url);
    },
    [router],
  );

  const setStatus = (value: string) => navigate(buildUrl({ status: value }));
  const toggleType = (type: EventType) => {
    const next = types.includes(type) ? types.filter((t) => t !== type) : [...types, type];
    navigate(buildUrl({ type: next }));
  };
  const toggleLocation = (loc: string) => {
    const next = locations.includes(loc)
      ? locations.filter((l) => l !== loc)
      : [...locations, loc];
    navigate(buildUrl({ location: next }));
  };
  const clearAll = () => navigate(pathname);

  const filteredLocations = indianLocations.filter((l) =>
    l.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  const activeCount =
    (status !== 'ongoing' ? 1 : 0) + (types.length > 0 ? 1 : 0) + (locations.length > 0 ? 1 : 0);

  return (
    <div ref={panelRef} className="relative self-start mt-1">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        ) : (
          <SlidersHorizontal className="w-4 h-4" />
        )}
        Filter
        {activeCount > 0 && !isPending && (
          <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Filter events"
          className="absolute right-0 top-11 z-50 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex flex-col gap-5"
        >
          {/* ── Status ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Status
            </legend>
            <div className="flex gap-2">
              {(['Upcoming', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    status === s
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ── Event Type ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Event Type
            </legend>
            <div className="flex flex-col gap-1">
              {eventTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={types.includes(type)}
                    onChange={() => toggleType(type)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span className="text-sm text-slate-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* ── Location ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Location
              {locations.length > 0 && (
                <span className="ml-1.5 text-indigo-600">({locations.length})</span>
              )}
            </legend>
            <input
              type="search"
              placeholder="Search locations…"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-1"
            />
            <div className="max-h-44 overflow-y-auto flex flex-col gap-0.5 rounded-lg">
              {filteredLocations.length === 0 ? (
                <p className="text-sm text-slate-400 px-3 py-2">No locations found</p>
              ) : (
                filteredLocations.map((loc) => (
                  <label
                    key={loc}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={locations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm text-slate-700">{loc}</span>
                  </label>
                ))
              )}
            </div>
          </fieldset>

          {/* ── Clear all ── */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors w-fit"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}