"use client";

import { useState } from "react";
import { ReserveModal } from "@/components/reserve-modal";
import { formatPrice } from "@/lib/data";

interface StockInfo {
  warehouseId: string;
  warehouseName: string;
  total: number;
  reserved: number;
  available: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category: string | null;
  price: number | null;
  stock: StockInfo[];
}

function StockDot({ available }: { available: number }) {
  if (available >= 10) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#1A4A3A" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#1A4A3A" }} />
        {available}
      </span>
    );
  }
  if (available >= 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#92400E" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#92400E" }} />
        {available}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium line-through" style={{ color: "#991B1B" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#991B1B" }} />
      0
    </span>
  );
}

export function InventoryTable({ products }: { products: Product[] }) {
  const [reserveProduct, setReserveProduct] = useState<Product | null>(null);

  // Group by category
  const categories = ["Haircare", "Skincare", "Wellness"];
  const grouped = categories
    .map((cat) => ({
      category: cat,
      products: products.filter((p) => p.category === cat),
    }))
    .filter((g) => g.products.length > 0);

  // Uncategorized
  const uncategorized = products.filter(
    (p) => !p.category || !categories.includes(p.category)
  );
  if (uncategorized.length > 0) {
    grouped.push({ category: "Other", products: uncategorized });
  }

  return (
    <>
      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-400 mb-4">
              {group.category}
            </h2>
            <div
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: "1px solid #E8E8E4" }}
            >
              {group.products.map((product, idx) => {
                const hasStock = product.stock.some((s) => s.available > 0);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      idx > 0 ? "border-t" : ""
                    }`}
                    style={{ borderColor: "#E8E8E4" }}
                  >
                    {/* SKU badge */}
                    <span className="hidden sm:inline-flex shrink-0 font-mono text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                      {product.sku}
                    </span>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {product.name}
                        </span>
                        <span className="sm:hidden font-mono text-[10px] text-zinc-400">
                          {product.sku}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-md">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Stock dots */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                      {product.stock.map((s) => (
                        <div
                          key={s.warehouseId}
                          className="flex items-center gap-1"
                        >
                          <span className="text-[10px] text-zinc-400">
                            {s.warehouseName.split(" ")[0]}
                          </span>
                          <StockDot available={s.available} />
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    {product.price && (
                      <span className="shrink-0 text-sm font-medium text-zinc-900 tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                    )}

                    {/* Reserve button */}
                    <button
                      onClick={() => setReserveProduct(product)}
                      disabled={!hasStock}
                      className="shrink-0 rounded px-3.5 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: hasStock ? "#18181b" : "#a1a1aa" }}
                    >
                      Reserve
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {reserveProduct && (
        <ReserveModal
          productId={reserveProduct.id}
          productName={reserveProduct.name}
          price={reserveProduct.price}
          stock={reserveProduct.stock}
          onClose={() => setReserveProduct(null)}
        />
      )}
    </>
  );
}
