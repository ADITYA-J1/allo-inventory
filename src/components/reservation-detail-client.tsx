"use client";

import { useState } from "react";
import { ReservationCountdown } from "./reservation-countdown";
import { ReservationActions } from "./reservation-actions";

type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED";

function StatusBadge({ status }: { status: ReservationStatus }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    RELEASED: "bg-zinc-100 text-zinc-500 ring-zinc-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.RELEASED
      }`}
    >
      {status}
    </span>
  );
}

interface ReservationDetailClientProps {
  id: string;
  initialStatus: ReservationStatus;
  expiresAt: string;
  confirmedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  warehouse: { name: string; location: string };
  quantity: number;
}

export function ReservationDetailClient({
  id,
  initialStatus,
  expiresAt,
  confirmedAt,
  releasedAt,
  createdAt,
  product,
  warehouse,
  quantity,
}: ReservationDetailClientProps) {
  const [status, setStatus] = useState<ReservationStatus>(initialStatus);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {product.name}
          </h1>
          <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-zinc-400">
            {product.sku}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 divide-y divide-zinc-100">
        <div className="flex justify-between py-3">
          <span className="text-sm text-zinc-500">Warehouse</span>
          <span className="text-sm font-medium text-zinc-900">
            {warehouse.name}
          </span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-sm text-zinc-500">Quantity</span>
          <span className="text-sm font-medium text-zinc-900">{quantity}</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-sm text-zinc-500">Created</span>
          <span className="text-sm font-medium text-zinc-900">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
        {(confirmedAt || status === "CONFIRMED") && (
          <div className="flex justify-between py-3">
            <span className="text-sm text-zinc-500">Confirmed</span>
            <span className="text-sm font-medium text-emerald-700">
              {confirmedAt
                ? new Date(confirmedAt).toLocaleString()
                : new Date().toLocaleString()}
            </span>
          </div>
        )}
        {(releasedAt || status === "RELEASED") && (
          <div className="flex justify-between py-3">
            <span className="text-sm text-zinc-500">Released</span>
            <span className="text-sm font-medium text-zinc-500">
              {releasedAt
                ? new Date(releasedAt).toLocaleString()
                : new Date().toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <ReservationCountdown expiresAt={expiresAt} status={status} />
        <ReservationActions
          id={id}
          status={status}
          expiresAt={expiresAt}
          onStatusChange={setStatus}
        />
      </div>
    </div>
  );
}
