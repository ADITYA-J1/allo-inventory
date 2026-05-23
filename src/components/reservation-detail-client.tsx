"use client";

import { useState } from "react";
import { ReservationCountdown } from "./reservation-countdown";
import { ReservationActions } from "./reservation-actions";
import { formatPrice } from "@/lib/data";

type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED";

function StatusDot({ status }: { status: ReservationStatus }) {
  const colors: Record<ReservationStatus, string> = {
    PENDING: "#D97706",
    CONFIRMED: "#1A4A3A",
    RELEASED: "#A1A1AA",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: colors[status] }}
      />
      <span
        className="text-xs font-medium"
        style={{
          color: status === "PENDING" ? "#92400E" : status === "CONFIRMED" ? "#1A4A3A" : "#71717A",
        }}
      >
        {status}
      </span>
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
  product: { name: string; sku: string; category: string | null; price: number | null };
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

  const shortId = id.slice(-8);
  const unitPrice = product.price;
  const totalPrice = unitPrice ? unitPrice * quantity : null;

  return (
    <div
      className="bg-white rounded-lg p-6"
      style={{ border: "1px solid #E8E8E4" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <span className="font-mono text-xs text-zinc-400">#{shortId}</span>
        <StatusDot status={status} />
      </div>

      {/* Content rows */}
      <div className="divide-y" style={{ borderColor: "#E8E8E4" }}>
        <div className="flex justify-between py-3">
          <span className="text-sm text-zinc-500">Product</span>
          <div className="text-right">
            <span className="text-sm font-medium text-zinc-900">
              {product.name}
            </span>
            <span className="block font-mono text-[10px] text-zinc-400">
              {product.sku}
            </span>
          </div>
        </div>

        {product.category && (
          <div className="flex justify-between py-3">
            <span className="text-sm text-zinc-500">Category</span>
            <span className="text-sm font-medium text-zinc-900">
              {product.category}
            </span>
          </div>
        )}

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

        {unitPrice && (
          <div className="flex justify-between py-3">
            <span className="text-sm text-zinc-500">Price</span>
            <span className="text-sm font-medium text-zinc-900">
              {formatPrice(unitPrice)} × {quantity} ={" "}
              {totalPrice ? formatPrice(totalPrice) : "—"}
            </span>
          </div>
        )}

        <div className="flex justify-between py-3">
          <span className="text-sm text-zinc-500">Created</span>
          <span className="text-sm font-medium text-zinc-900">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>

        {(confirmedAt || status === "CONFIRMED") && (
          <div className="flex justify-between py-3">
            <span className="text-sm text-zinc-500">Confirmed</span>
            <span className="text-sm font-medium" style={{ color: "#1A4A3A" }}>
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

      {/* Countdown + Actions */}
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
