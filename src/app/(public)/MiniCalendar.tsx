"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
};

export function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-800">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={onNextMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          // Find events for this specific day
          const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.start_time), day)
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-20 border rounded-lg p-1 relative flex flex-col gap-1 transition-colors",
                !isSameMonth(day, monthStart) ? "bg-slate-50 text-slate-300" : "bg-white",
                isSameDay(day, new Date()) ? "border-indigo-500" : "border-slate-100"
              )}
            >
              <span className="text-xs font-medium self-end mr-1">
                {format(day, "d")}
              </span>
              
              {/* Event Dots/Links */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block truncate text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded hover:bg-indigo-200 transition-colors"
                    title={event.title}
                  >
                    {event.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}