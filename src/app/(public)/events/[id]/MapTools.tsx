'use client';

import { MapPin, ExternalLink } from 'lucide-react';

interface MapProps {
  place: string;
  location: string;
  placeUrl: string | null | undefined;
}
function parseCoords(placeUrl: string | null | undefined) {
  if (!placeUrl) return null;
  const match = placeUrl.match(/([-\d.]+)[,\s]+([-\d.]+)/);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

function getMapUrl(lat: number, lng: number, label: string): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/iPhone|iPad|iPod/.test(ua))
    return `maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`;
  if (/Android/.test(ua))
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function MapLink({ place, location, placeUrl }: MapProps) {
  const coords = parseCoords(placeUrl);
  const label = `${place}, ${location}`;

  if (!coords) {
    return (
      <div className="flex items-center gap-2 mt-4 text-slate-500">
        <MapPin className="w-4 h-4 shrink-0" />
        <span>{label} · TBD</span>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!coords) return;
    window.open(getMapUrl(coords.lat, coords.lng, label), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2 mt-4 text-slate-500">
      <MapPin className="w-4 h-4 shrink-0" />
      <a href="#" onClick={handleClick} className="underline hover:text-slate-700 transition-colors">
        {label}
      </a>
    </div>
  );
}

export function MapPreview({ place, location, placeUrl }: MapProps) {
  const coords = parseCoords(placeUrl);
  if (!coords) return null;

  const { lat, lng } = coords;
  const label = `${place}, ${location}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.008},${lng + 0.01},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;

  const handleOpen = () => {
    window.open(getMapUrl(lat, lng, label), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-6 group relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div className="relative w-full h-48 pointer-events-none">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          className="w-full h-full"
          loading="lazy"
          title={`Map showing ${label}`}
          aria-label={`Map location of ${label}`}
        />
      </div>
      <button
        onClick={handleOpen}
        className="absolute inset-0 w-full h-full bg-transparent hover:bg-black/10 transition-colors duration-200 cursor-pointer flex items-end"
        aria-label={`Open ${label} in maps`}
      >
        <div className="w-full bg-white/90 backdrop-blur-sm border-t border-slate-200 px-3 py-2 flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
        </div>
      </button>
    </div>
  );
}