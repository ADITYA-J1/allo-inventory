import { getProducts } from "@/lib/data";
import { InventoryTable } from "@/components/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getProducts();

  return (
    <main className="flex-1">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm"
        style={{ borderBottom: "1px solid #E8E8E4" }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "#1A4A3A" }}
            >
              Allo
            </a>
            <span className="text-zinc-300">/</span>
            <span className="text-sm text-zinc-400">Inventory</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#1A4A3A" }}
            />
            <span className="text-xs text-zinc-400">Live</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <InventoryTable products={products} />

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm">No products found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
