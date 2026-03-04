"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCounter({
  value,
  label,
  colorClass,
}: {
  value: number;
  label: string;
  colorClass: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-200"
    >
      <span className={cn("text-5xl font-extrabold mb-2", colorClass)}>
        {displayValue.toLocaleString()}
      </span>
      <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}