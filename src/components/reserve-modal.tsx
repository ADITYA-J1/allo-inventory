"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";

interface StockInfo {
  warehouseId: string;
  warehouseName: string;
  total: number;
  reserved: number;
  available: number;
}

interface ReserveModalProps {
  productId: string;
  productName: string;
  price: number | null;
  stock: StockInfo[];
  onClose: () => void;
}

export function ReserveModal({
  productId,
  productName,
  price,
  stock,
  onClose,
}: ReserveModalProps) {
  const router = useRouter();
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const availableWarehouses = stock.filter((s) => s.available > 0);
  const selectedStock = stock.find((s) => s.warehouseId === warehouseId);
  const maxQuantity = selectedStock
    ? Math.min(selectedStock.available, 100)
    : 0;
  const totalPrice = price ? price * quantity : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId || quantity < 1) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity }),
      });

      if (res.status === 201) {
        const data = await res.json();
        toast.success("Reservation created");
        router.push(`/reservation/${data.id}`);
        return;
      }

      if (res.status === 409) {
        toast.error("Not enough stock in that warehouse");
        setLoading(false);
        return;
      }

      const err = await res.json();
      toast.error(err.error || "Something went wrong");
      setLoading(false);
    } catch {
      toast.error("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-white rounded-lg p-6"
        style={{ border: "1px solid #E8E8E4" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {productName}
            </h3>
            {price && (
              <p className="text-sm text-zinc-500 mt-0.5">
                {formatPrice(price)} per unit
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 tracking-wide uppercase">
              Warehouse
            </label>
            <select
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                setQuantity(1);
              }}
              className="w-full rounded px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A4A3A]"
              style={{ border: "1px solid #E8E8E4" }}
              required
            >
              <option value="">Select warehouse…</option>
              {availableWarehouses.map((s) => (
                <option key={s.warehouseId} value={s.warehouseId}>
                  {s.warehouseName} — {s.available} available
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 tracking-wide uppercase">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!warehouseId || quantity <= 1}
                className="h-9 w-9 flex items-center justify-center rounded text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
                style={{ border: "1px solid #E8E8E4" }}
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium font-mono tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(maxQuantity, quantity + 1))
                }
                disabled={!warehouseId || quantity >= maxQuantity}
                className="h-9 w-9 flex items-center justify-center rounded text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
                style={{ border: "1px solid #E8E8E4" }}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !warehouseId || quantity < 1}
            className="w-full rounded px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1A4A3A" }}
          >
            {loading
              ? "Reserving…"
              : totalPrice
              ? `Reserve for ${formatPrice(totalPrice)}`
              : "Reserve"}
          </button>
        </form>
      </div>
    </div>
  );
}
