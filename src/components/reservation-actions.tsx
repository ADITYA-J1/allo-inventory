"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED";

interface ReservationActionsProps {
  id: string;
  status: ReservationStatus;
  expiresAt: string;
  onStatusChange: (status: ReservationStatus) => void;
}

export function ReservationActions({
  id,
  status,
  expiresAt,
  onStatusChange,
}: ReservationActionsProps) {
  const [loading, setLoading] = useState<"confirm" | "release" | null>(null);
  const [expired, setExpired] = useState(
    () => new Date(expiresAt).getTime() <= Date.now()
  );

  useEffect(() => {
    if (status !== "PENDING") return;

    const interval = setInterval(() => {
      if (new Date(expiresAt).getTime() <= Date.now()) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status]);

  const isDisabled = status !== "PENDING" || expired || loading !== null;

  async function handleConfirm() {
    setLoading("confirm");
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
      });

      if (res.ok) {
        onStatusChange("CONFIRMED");
        toast.success("Purchase confirmed!");
        return;
      }

      if (res.status === 410) {
        setExpired(true);
        toast.error("This reservation has expired");
        return;
      }

      const err = await res.json();
      toast.error(err.error || "Failed to confirm");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(null);
    }
  }

  async function handleRelease() {
    setLoading("release");
    try {
      const res = await fetch(`/api/reservations/${id}/release`, {
        method: "POST",
      });

      if (res.ok) {
        onStatusChange("RELEASED");
        toast.success("Reservation cancelled");
        return;
      }

      const err = await res.json();
      toast.error(err.error || "Failed to cancel");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(null);
    }
  }

  if (status === "CONFIRMED") {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-emerald-700">
            Purchase confirmed
          </p>
        </div>
      </div>
    );
  }

  if (status === "RELEASED") {
    return (
      <div className="rounded-lg bg-zinc-100 border border-zinc-200 px-4 py-3">
        <p className="text-sm font-medium text-zinc-500">
          Reservation cancelled
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleConfirm}
        disabled={isDisabled}
        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "confirm" ? "Confirming…" : "Confirm Purchase"}
      </button>
      <button
        onClick={handleRelease}
        disabled={isDisabled}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "release" ? "Cancelling…" : "Cancel"}
      </button>
    </div>
  );
}
