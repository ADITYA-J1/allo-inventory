import Link from "next/link";
import { ReservationDetailClient } from "@/components/reservation-detail-client";

export const dynamic = "force-dynamic";

async function getReservation(id: string) {
  const { prisma } = await import("@/lib/prisma");

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, sku: true, category: true, price: true } },
      warehouse: { select: { name: true, location: true } },
    },
  });

  if (!reservation) return null;

  return {
    id: reservation.id,
    productId: reservation.productId,
    warehouseId: reservation.warehouseId,
    quantity: reservation.quantity,
    status: reservation.status as "PENDING" | "CONFIRMED" | "RELEASED",
    expiresAt: reservation.expiresAt.toISOString(),
    confirmedAt: reservation.confirmedAt?.toISOString() ?? null,
    releasedAt: reservation.releasedAt?.toISOString() ?? null,
    createdAt: reservation.createdAt.toISOString(),
    product: reservation.product,
    warehouse: reservation.warehouse,
  };
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
            href="/inventory"
            className="mt-6 inline-flex items-center rounded px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#1A4A3A" }}
          >
            ← Back to Inventory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[520px] px-4 py-12 sm:px-6">
        <Link
          href="/inventory"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-8"
        >
          ← Back to Inventory
        </Link>

        <ReservationDetailClient
          id={reservation.id}
          initialStatus={reservation.status}
          expiresAt={reservation.expiresAt}
          confirmedAt={reservation.confirmedAt}
          releasedAt={reservation.releasedAt}
          createdAt={reservation.createdAt}
          product={reservation.product}
          warehouse={reservation.warehouse}
          quantity={reservation.quantity}
        />

        <p className="mt-6 text-center font-mono text-[10px] text-zinc-400">
          {reservation.id}
        </p>
      </div>
    </main>
  );
}
