interface StockBadgeProps {
  available: number;
}

export function StockBadge({ available }: StockBadgeProps) {
  if (available >= 10) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        In Stock
      </span>
    );
  }

  if (available >= 1) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
        Low Stock ({available})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
      Out of Stock
    </span>
  );
}
