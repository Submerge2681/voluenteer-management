'use client';

import dynamic from 'next/dynamic';

const DynamicAddToCalendar = dynamic(
  () =>
    import('add-to-calendar-button-react').then((mod) => ({
      default: mod.AddToCalendarButton,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 h-12 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-sm">
        Loading Add to Calendar...
      </div>
    ),
  }
);

interface Props {
  event: {
    title: string;
    description?: string;
    startTime: string;
    location?: string;
  };
}

export default function AddToCalendarButtonComponent({ event }: Props) {
  const start = new Date(event.startTime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2-hour event (change if needed)

  return (
    <div className="mt-8">
      <DynamicAddToCalendar
        name={event.title}
        description={event.description || 'No description provided.'}
        startDate={start.toISOString().split('T')[0]}
        startTime={start.toTimeString().slice(0, 5)}
        endDate={end.toISOString().split('T')[0]}
        endTime={end.toTimeString().slice(0, 5)}
        location={event.location || 'TBD'}
        options={[
          'Google',
          'Apple',
          'Microsoft365',
          'Yahoo',
          'iCal',
          'Outlook.com',
          'MicrosoftTeams'
        ]}
        label="Add to Calendar"
        styleLight="--btn-background: #4f46e5; --btn-text: #ffffff; --btn-hover: #4338ca;"
        buttonStyle="default"
        size="medium"
        hideBackground
        trigger="click"
        listStyle="dropup-static"
        
      />
    </div>
  );
}