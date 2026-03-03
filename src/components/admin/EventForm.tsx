'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

type EventFormProps = {
  mode: 'create' | 'edit';
  initialData?: any;
  locations: string[];
  badges: any[];
  onSubmitAction: (formData: FormData) => Promise<{ error: string | null } | void>;
};

export default function EventForm({ mode, initialData = {}, locations, badges, onSubmitAction }: EventFormProps) {
  const[isCompleted, setIsCompleted] = useState(initialData.is_completed || false);
  const[checkinType, setCheckinType] = useState(initialData.checkin_type || 'static_otp');
  const[isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const file = formData.get('image') as File;
    if (file && file.size > 1 * 1024 * 1024) {
      setError("File is too large! Please upload an image under 1MB.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await onSubmitAction(formData);
        if (result?.error) {
          setError(result.error);
        }
      } catch (err) {
        if (isRedirectError(err)) throw err; // Allow Next.js to handle the redirect
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    });
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 space-y-6 text-slate-700">
        
        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1">
            Event Thumbnail
          </label>
          {initialData.image_url && (
            <div className="mb-3">
              <img
                src={initialData.image_url}
                alt="Current thumbnail"
                className="w-40 h-40 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}
          <input
            type="file" name="image" id="image" accept="image/jpeg,image/png,image/webp,image/heic"
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
          <input type="text" name="title" id="title" defaultValue={initialData.title} required className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="e.g. Beach Cleanup 2026" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-slate-700 mb-1">Start Date & Time</label>
            <input type="datetime-local" name="start_time" id="start_time" defaultValue={initialData.start_time?.slice(0, 16)} required className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-slate-700 mb-1">End Date & Time</label>
            <input type="datetime-local" name="end_time" id="end_time" defaultValue={initialData.end_time?.slice(0, 16)} required className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label htmlFor="location" className="text-sm font-medium text-slate-700 mb-1">State / Region</label>
            <select name="location" id="location" defaultValue={initialData.location || ''} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Select a location</option>
              {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
            </select>
          </div>
          
          {/* Event Type */}
          <div>
            <label htmlFor="event_type" className="text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select name="event_type" id="event_type" defaultValue={initialData.event_type || ''} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Select event type</option>
              <option value="cleanup">Cleanup</option>
              <option value="picnic">Picnic</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Place */}
          <div>
            <label htmlFor="place" className="text-sm font-medium text-slate-700 mb-1">Gathering Point</label>
            <input type="text" name="place" id="place" defaultValue={initialData.place} required className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="e.g. Marina Beach, Gate 1" />
          </div>

          {/* Maps */}
          <div>
            <label htmlFor="place_url" className="text-sm font-medium text-slate-700 mb-1">Latitude and Longatude</label>
            <input type="url" name="place_url" id="place_url" defaultValue={initialData.place_url} required className="text-blue-700 underline block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="12.733411188021822, 80.21606848868025" />
          </div>
        </div>

        {/* Badges */}
        <div>
          <label htmlFor="badge_url" className="text-sm font-medium text-slate-700 mb-1">Badge</label>
          <select name="badge_url" id="badge_url" defaultValue={initialData.badge_url || ''} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
            <option value="" disabled>Select badge type</option>
            {badges?.map((badge) => (<option key={badge.url} value={badge.url}>{badge.name}</option>))}
          </select>
        </div>

        {mode === 'edit' && (
            <>
                {/* Waste Collected */}
                <div>
                <label htmlFor="waste_kg" className="block text-sm font-medium text-slate-700 mb-1">
                    Total Waste Collected {isCompleted ? '' : '(only visible when completed)'}
                </label>
                <input
                    type="number" name="waste_kg" id="waste_kg"
                    defaultValue={initialData.waste_kg ?? ''}
                    disabled={!isCompleted} required={isCompleted} step="0.01"
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                />
                </div>

                {/* Completed Toggle */}
                <div className="flex items-start pb-3">
                <input
                    id="is_completed" name="is_completed" type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="h-5 w-5 mt-1 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <div className="ml-3">
                    <label htmlFor="is_completed" className="font-medium text-slate-700 cursor-pointer">Mark as Completed</label>
                    <p className="text-sm text-red-500">Event will show as "Completed".</p>
                </div>
                </div>
            </>
        )}

        {/* Description */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="body" id="body" rows={6} defaultValue={initialData.body || ''} className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-y" />
        </div>

        {/* Security Settings (Only available during Creation) */}
        {mode === 'create' && (
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
        )}

        {/* Error Messaging */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-8 py-5 flex justify-end border-t border-slate-200">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          {isPending ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Event Changes'}
        </button>
      </div>
    </form>
  );
}