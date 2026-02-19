'use client';

import { useState, useEffect, useRef } from 'react';
import { LocationEdit } from 'lucide-react';
import { indianLocations } from '../locations';

interface LocationSelectorProps {
  initialLocations: string[];
}

export default function LocationSelector({ initialLocations = [] }: LocationSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialLocations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const filteredLocations = indianLocations
    .filter((loc) => 
      loc.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !selected.includes(loc)
    )
    .sort();

  const addLocation = (location: string) => {
    if (!selected.includes(location)) {
      setSelected((prev) => [...prev, location]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeLocation = (locationToRemove: string) => {
    setSelected((prev) => prev.filter((loc) => loc !== locationToRemove));
  };

  // Sync hidden input with form submission
  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = JSON.stringify(selected);
    }
  }, [selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Locations <span className="text-slate-400">(India only – multiple allowed)</span>
      </label>

      {/* Bubbles / Tags */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[42px] p-1">
        {selected.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-1 px-2">No locations selected yet</p>
        ) : (
          selected.map((loc) => (
            <div
              key={loc}
              className="inline-flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm pl-3 pr-2 py-1 rounded-full border border-indigo-200 transition-colors group"
            >
              {loc}
              <button
                type="button"
                onClick={() => removeLocation(loc)}
                className="ml-2 text-indigo-400 hover:text-red-600 p-0.5 rounded-full group-hover:bg-white/70 transition-colors"
                aria-label={`Remove ${loc}`}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Search + Dropdown */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LocationEdit className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search cities in India..."
          className="block w-full pl-10 py-2 sm:text-sm border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto py-1 text-sm">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <div
                  key={loc}
                  onClick={() => addLocation(loc)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-p~ointer transition-colors"
                >
                  {loc}
                </div>
              ))
            ) : searchTerm ? (
              <div className="px-4 py-6 text-center text-slate-500">
                No matching locations found
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-slate-500 text-xs">
                Start typing to search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden field that the server action reads */}
      <input
        type="hidden"
        name="locations"
        ref={hiddenInputRef}
        value={JSON.stringify(selected)}
      />
    </div>
  );
}
