"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StockInfo {
  warehouseId: string;
  warehouseName: string;
  total: number;
  reserved: number;
  available: number;
}

interface ReserveFormProps {
  productId: string;
  stock: StockInfo[];
  onClose: () => void;
}

export function ReserveForm({ productId, stock, onClose }: ReserveFormProps) {
  const router = useRouter();
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const availableWarehouses = stock.filter((s) => s.available > 0);
  const selectedStock = stock.find((s) => s.warehouseId === warehouseId);
  const maxQuantity = selectedStock ? selectedStock.available : 0;

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
        toast.success("Reservation created successfully");
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
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
      <div>
        <label
          htmlFor={`warehouse-${productId}`}
          className="block text-xs font-medium text-zinc-500 mb-1"
        >
          Warehouse
        </label>
        <select
          id={`warehouse-${productId}`}
          value={warehouseId}
          onChange={(e) => {
            setWarehouseId(e.target.value);
            setQuantity(1);
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
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
        <label
          htmlFor={`quantity-${productId}`}
          className="block text-xs font-medium text-zinc-500 mb-1"
        >
          Quantity
        </label>
        <input
          id={`quantity-${productId}`}
          type="number"
          min={1}
          max={Math.min(maxQuantity, 100)}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          required
          disabled={!warehouseId}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !warehouseId || quantity < 1}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Reserving…" : "Reserve"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
