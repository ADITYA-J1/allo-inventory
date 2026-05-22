import Link from "next/link";
import { ReservationDetailClient } from "@/components/reservation-detail-client";

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

        <p className="mt-6 text-center text-xs text-zinc-400">
          Reservation ID: {reservation.id}
        </p>
      </div>
    </main>
  );
}
