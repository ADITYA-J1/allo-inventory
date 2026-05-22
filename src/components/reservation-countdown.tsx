"use client";

import { useEffect, useState } from "react";

interface ReservationCountdownProps {
  expiresAt: string;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
}

export function ReservationCountdown({
  expiresAt,
  status,
}: ReservationCountdownProps) {
  const [remaining, setRemaining] = useState<number>(() => {
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    if (status !== "PENDING") return;

    const interval = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status]);

  if (status === "CONFIRMED") {
    return null;
  }

  if (status === "RELEASED") {
    return null;
  }

  if (remaining <= 0) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          Reservation expired
        </p>
      </div>
    );
  }

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Progress from 0 to 1 (1 = full time remaining)
  const totalDuration = 10 * 60 * 1000; // 10 minutes
  const progress = Math.min(remaining / totalDuration, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Time Remaining
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold text-zinc-900 tabular-nums">
          {formatted}
        </p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress * 100}%`,
            backgroundColor:
              progress > 0.3
                ? "#22c55e"
                : progress > 0.1
                ? "#f59e0b"
                : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}
