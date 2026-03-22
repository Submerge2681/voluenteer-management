'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  endDate?: string;
}

export default function CountdownTimer({ targetDate, endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPast, setIsPast] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();
    const endTime = endDate ? new Date(endDate).getTime() : null;

    const updateCountdown = () => {
      const now = Date.now();

      if (endTime && now >= endTime) {
        setIsCompleted(true);
        setIsPast(true);
        return;
      }

      const difference = targetTime - now;

      if (difference <= 0) {
        setIsPast(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    // Run immediately so there's no flash of zeros
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate, endDate]);

  if (isCompleted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-600 font-medium">
          <AlertCircle className="w-5 h-5" />
          Event has concluded
        </div>
      </div>
    );
  }

  if (isPast) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-600 font-medium">
          <AlertCircle className="w-5 h-5" />
          Event has started!
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <p className="text-center text-slate-500 text-sm mb-4 tracking-wide">TIME UNTIL EVENT STARTS</p>
      
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-white rounded-xl py-4 border border-slate-100 shadow-sm">
          <div className="text-xl font-semibold text-slate-900 tabular-nums">
            {timeLeft.days}
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-1 tracking-widest">DAYS</div>
        </div>

        <div className="bg-white rounded-xl py-4 border border-slate-100 shadow-sm">
          <div className="text-xl font-semibold text-slate-900 tabular-nums">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-1 tracking-widest">HRS</div>
        </div>

        <div className="bg-white rounded-xl py-4 border border-slate-100 shadow-sm">
          <div className="text-xl font-semibold text-slate-900 tabular-nums">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-1 tracking-widest">MIN</div>
        </div>

        <div className="bg-white rounded-xl py-4 border border-slate-100 shadow-sm">
          <div className="text-xl font-semibold text-slate-900 tabular-nums">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-1 tracking-widest">SEC</div>
        </div>
      </div>
    </div>
  );
}