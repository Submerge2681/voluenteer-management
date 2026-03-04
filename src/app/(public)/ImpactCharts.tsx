"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type WasteData = {
  name: string; // Event title or Date
  waste: number;
};

type CityData = {
  city: string;
  participants: number;
};

export function WasteGrowthChart({ data }: { data: WasteData[] }) {
  return (
    <div className="h-75 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-700">Total waste collected</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f39f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4f39f6" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} hide />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Area
            type="monotone"
            dataKey="waste"
            stroke="#4f39f6"
            fillOpacity={1}
            fill="url(#colorWaste)"
            name="Waste (kg)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopCitiesChart({ data }: { data: CityData[] }) {
  return (
    <div className="h-75 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-700">Most Active Cities</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="city" 
            type="category" 
            width={100} 
            tick={{ fontSize: 12, fill: '#475569' }} 
          />
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          <Bar 
            dataKey="participants" 
            fill="#6366f1" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
            name="Volunteers"
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}