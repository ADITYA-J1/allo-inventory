import Link from "next/link";
import { ReservationCountdown } from "@/components/reservation-countdown";
import { ReservationActions } from "@/components/reservation-actions";

interface ReservationData {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  confirmedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  warehouse: { name: string; location: string };
}

export const dynamic = "force-dynamic";

async function getReservation(id: string): Promise<ReservationData | null> {
  const { prisma } = await import("@/lib/prisma");

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, sku: true } },
      warehouse: { select: { name: true, location: true } },
    },
  });

  if (!reservation) return null;

  return {
    id: reservation.id,
    productId: reservation.productId,
    warehouseId: reservation.warehouseId,
    quantity: reservation.quantity,
    status: reservation.status,
    expiresAt: reservation.expiresAt.toISOString(),
    confirmedAt: reservation.confirmedAt?.toISOString() ?? null,
    releasedAt: reservation.releasedAt?.toISOString() ?? null,
    createdAt: reservation.createdAt.toISOString(),
    product: reservation.product,
    warehouse: reservation.warehouse,
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    CONFIRMED:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    RELEASED:
      "bg-zinc-100 text-zinc-500 ring-zinc-500/20",
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

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservation(id);

  if (!reservation) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Reservation not found
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            This reservation may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            ← Back to Inventory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors mb-8"
        >
          ← Back to Inventory
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">
                {reservation.product.name}
              </h1>
              <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-xs text-zinc-400">
                {reservation.product.sku}
              </p>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          <div className="mt-6 divide-y divide-zinc-100">
            <div className="flex justify-between py-3">
              <span className="text-sm text-zinc-500">Warehouse</span>
              <span className="text-sm font-medium text-zinc-900">
                {reservation.warehouse.name}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-zinc-500">Quantity</span>
              <span className="text-sm font-medium text-zinc-900">
                {reservation.quantity}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-zinc-500">Created</span>
              <span className="text-sm font-medium text-zinc-900">
                {new Date(reservation.createdAt).toLocaleString()}
              </span>
            </div>
            {reservation.confirmedAt && (
              <div className="flex justify-between py-3">
                <span className="text-sm text-zinc-500">Confirmed</span>
                <span className="text-sm font-medium text-emerald-700">
                  {new Date(reservation.confirmedAt).toLocaleString()}
                </span>
              </div>
            )}
            {reservation.releasedAt && (
              <div className="flex justify-between py-3">
                <span className="text-sm text-zinc-500">Released</span>
                <span className="text-sm font-medium text-zinc-500">
                  {new Date(reservation.releasedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <ReservationCountdown
              expiresAt={reservation.expiresAt}
              status={reservation.status}
            />
            <ReservationActions
              id={reservation.id}
              status={reservation.status}
              expiresAt={reservation.expiresAt}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Reservation ID: {reservation.id}
        </p>
      </div>
    </main>
  );
}
