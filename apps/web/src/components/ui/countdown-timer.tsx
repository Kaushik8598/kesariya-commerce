"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endsAt: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const blocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-lg font-extrabold tabular-nums backdrop-blur-sm">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-widest opacity-70">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="mb-4 text-lg font-bold opacity-40">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
