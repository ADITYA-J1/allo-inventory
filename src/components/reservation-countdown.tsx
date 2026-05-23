"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  if (status === "CONFIRMED" || status === "RELEASED") {
    return null;
  }

  if (remaining <= 0) {
    return (
      <div className="space-y-3">
        <div
          className="rounded px-4 py-3"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <p className="text-sm font-medium" style={{ color: "#991B1B" }}>
            Reservation expired
          </p>
        </div>
        <Link href="/inventory" className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Back to Inventory
        </Link>
      </div>
    );
  }

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const totalDuration = 10 * 60 * 1000;
  const progress = Math.min(remaining / totalDuration, 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-zinc-400">
          Hold expires in
        </p>
        <p className="font-mono text-xl font-semibold text-zinc-900 tabular-nums">
          {formatted}
        </p>
      </div>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: "#E8E8E4" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress * 100}%`,
            backgroundColor:
              progress > 0.3
                ? "#1A4A3A"
                : progress > 0.1
                ? "#D97706"
                : "#DC2626",
          }}
        />
      </div>
      <p className="text-xs text-zinc-400">
        Stock is held for you. Confirm or it will release automatically.
      </p>
    </div>
  );
}
