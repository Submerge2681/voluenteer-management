'use client'; // Client component for interactivity (showing/hiding PIN field)

import { useState } from 'react';
import { useActionState } from 'react';
import { createEvent } from './actions';
import { indianLocations } from '@/components/locations';
import { useMemo } from 'react'


type FormState = { error: string | null };

export default function NewEventPage() {
  const [checkinType, setCheckinType] = useState('static_otp');
  const [state, formAction] = useActionState<FormState, FormData>((_prevState: FormState, formData: FormData) => createEvent(formData), { error: null });
  const sortedLocations = useMemo(() => {
    return [...indianLocations].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    )
  }, [indianLocations])


  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Create New Event</h1>
      
      <form action={formAction} className="space-y-6 bg-white p-8 rounded-xl border shadow-sm text-slate-700">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Event Title</label>
          <input name="title" type="text" required placeholder="e.g. Beach Cleanup 2026" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea name="body" rows={3} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>


        
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Location
          </label>

          <select name="location" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 bg-white">
            <option value="" disabled>
              Select a location
            </option>

            {sortedLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}

          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Start Time</label>
          <input name="start_time" type="datetime-local" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Security Settings</h3>
          
          {/* Check-in Type */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className={`border p-4 rounded-lg cursor-pointer flex flex-col items-center ${checkinType === 'static_otp' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}>
              <input 
                type="radio" 
                name="checkin_type" 
                value="static_otp" 
                checked={checkinType === 'static_otp'}
                onChange={() => setCheckinType('static_otp')}
                className="sr-only" 
              />
              <span className="font-bold text-slate-900">Static PIN</span>
              <span className="text-xs text-slate-500 mt-1">Simple 6-digit code</span>
            </label>

            <label className={`border p-4 rounded-lg cursor-pointer flex flex-col items-center ${checkinType === 'totp' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}>
              <input 
                type="radio" 
                name="checkin_type" 
                value="totp" 
                checked={checkinType === 'totp'}
                onChange={() => setCheckinType('totp')}
                className="sr-only" 
              />
              <span className="font-bold text-slate-900">Dynamic QR (TOTP)</span>
              <span className="text-xs text-slate-500 mt-1">Rotating 30s secure code</span>
            </label>
          </div>

          {/* Conditional Input for Static PIN */}
          {checkinType === 'static_otp' && (
             <div>
                <label className="block text-sm font-medium text-slate-700">Custom PIN (Optional)</label>
                <input 
                  name="static_pin" 
                  type="text" 
                  placeholder="Leave empty to auto-generate" 
                  maxLength={6}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" 
                />
                <p className="text-xs text-slate-500 mt-1">If left empty, a random code will be created.</p>
             </div>
          )}
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
          Create Event
        </button>

        {state?.error && (
          <p className="mt-4 text-red-500 text-center">{state.error}</p>
        )}
      </form>
    </div>
  );
}