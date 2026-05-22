"use client";

import { useState } from "react";
import { StockBadge } from "./stock-badge";
import { ReserveForm } from "./reserve-form";

interface StockInfo {
  warehouseId: string;
  warehouseName: string;
  total: number;
  reserved: number;
  available: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  stock: StockInfo[];
}

export function ProductCard({ id, name, description, sku, stock }: ProductCardProps) {
  const [showForm, setShowForm] = useState(false);

  const hasAnyStock = stock.some((s) => s.available > 0);

  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-zinc-900 leading-tight">
            {name}
          </h2>
          <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-zinc-400">
            {sku}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Stock by Warehouse
        </p>
        <div className="space-y-1.5">
          {stock.map((s) => (
            <div
              key={s.warehouseId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-600">{s.warehouseName}</span>
              <StockBadge available={s.available} />
            </div>
          ))}
        </div>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          disabled={!hasAnyStock}
          className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {hasAnyStock ? "Reserve" : "Out of Stock"}
        </button>
      )}

      {showForm && (
        <ReserveForm
          productId={id}
          stock={stock}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
