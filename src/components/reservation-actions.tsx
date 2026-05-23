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
      <div
        className="rounded px-4 py-3"
        style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#1A4A3A"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium" style={{ color: "#1A4A3A" }}>
            Purchase confirmed
          </p>
        </div>
      </div>
    );
  }

  if (status === "RELEASED") {
    return (
      <div
        className="rounded px-4 py-3"
        style={{ backgroundColor: "#F4F4F5", border: "1px solid #E4E4E7" }}
      >
        <p className="text-sm font-medium text-zinc-500">
          Reservation cancelled
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConfirm}
        disabled={isDisabled}
        className="w-full rounded px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#1A4A3A" }}
      >
        {loading === "confirm" ? "Confirming…" : "Confirm purchase"}
      </button>
      <button
        onClick={handleRelease}
        disabled={isDisabled}
        className="w-full text-sm text-zinc-400 hover:text-zinc-600 transition-colors py-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "release" ? "Cancelling…" : "Cancel reservation"}
      </button>
    </div>
  );
}
