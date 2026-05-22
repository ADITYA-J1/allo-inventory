import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Browse products and reserve stock from available warehouses.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              sku={product.sku}
              stock={product.stock}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm">No products found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
