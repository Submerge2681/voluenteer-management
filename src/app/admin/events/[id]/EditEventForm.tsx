'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { updateEvent } from './actions';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

// Define the types based on your DB schema
type EventFormProps = {
  eventId: string;
  event: any; 
  locations: string[];
  badges: any[];
};

export default function EditEventForm({ eventId, event, locations, badges }: EventFormProps) {
  const [isCompleted, setIsCompleted] = useState(event.is_completed || false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bind the ID to the server action
  const updateEventWithId = updateEvent.bind(null, eventId);

  const handleSubmit = async (formData: FormData) => {
    const file = formData.get('image') as File;
  
    if (file && file.size > 1 * 1024 * 1024) {
        alert("File is too large! Please upload an image under 1MB.");
        return;
    }
    setIsPending(true);
    try {
      await updateEventWithId(formData);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 space-y-6"> {/* Changed space-y-4 to space-y-6 for better layout rhythm */}
        
        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1">
            Event Thumbnail
          </label>
          {event.image_url && (
            <div className="mb-3">
              <img
                src={event.image_url}
                alt="Current thumbnail"
                className="w-40 h-40 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}
          <input
            type="file" name="image" id="image" accept="image/*"
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
          <input type="text" name="title" id="title" defaultValue={event.title} required className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-slate-700 mb-1">Start Date & Time</label>
            <input type="datetime-local" name="start_time" id="start_time" defaultValue={event.start_time?.slice(0, 16)} required className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-slate-700 mb-1">End Date & Time</label>
            <input type="datetime-local" name="end_time" id="end_time" defaultValue={event.end_time?.slice(0, 16)} required className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label htmlFor="location" className="text-sm font-medium text-slate-700 mb-1">Location</label>
            <select name="location" id="location" defaultValue={event.location || ''} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Select a location</option>
              {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
            </select>
          </div>
          
          {/* Event Type */}
          <div>
            <label htmlFor="event_type" className="text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select name="event_type" id="event_type" defaultValue={event.event_type || ''} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
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
            <input type="text" name="place" id="place" defaultValue={event.place} required className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" />
          </div>

          {/* Maps */}
          <div>
            <label htmlFor="place_url" className="text-sm font-medium text-slate-700 mb-1">Google maps url</label>
            <input type="text" name="place_url" id="place_url" defaultValue={event.place_url} required className="text-blue-700 underline block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg" />
          </div>
          
        </div>

        {/* Badges */}
        <div>
          <label htmlFor="badge_url" className="text-sm font-medium text-slate-700 mb-1">Badge</label>
          <select name="badge_url" id="badge_url" defaultValue={event.badge_url || ''} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 bg-white focus:ring-2 focus:ring-indigo-500">
            <option value="" disabled>Select badge type</option>
            {badges?.map((badge) => (<option key={badge.url} value={badge.url}>{badge.name}</option>))}
          </select>
        </div>

        {/* Waste Collected */}
        <div>
          <label htmlFor="waste_kg" className="block text-sm font-medium text-slate-700 mb-1">
            Total Waste Collected {isCompleted ? '' : '(only visible when completed)'}
          </label>
          <input
            type="number" name="waste_kg" id="waste_kg"
            defaultValue={event.waste_kg ?? ''}
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

        {/* Description */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="body" id="body" rows={6} defaultValue={event.body || ''} className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-y" />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-8 py-5 flex justify-end border-t border-slate-200">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          {isPending ? 'Saving...' : 'Save Event Changes'}
        </button>
      </div>
    </form>
  );
}