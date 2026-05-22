import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { createReservationSchema } from "@/schemas/reservation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, warehouseId, quantity } = parsed.data;

    // BONUS: Idempotency check
    const idempotencyKey = req.headers.get("idempotency-key");
    if (idempotencyKey) {
      const cached = await redis.get<string>(`idempotency:${idempotencyKey}`);
      if (cached) {
        return NextResponse.json(
          typeof cached === "string" ? JSON.parse(cached) : cached,
          { status: 200 }
        );
      }
    }

    // CONCURRENCY-SAFE RESERVATION
    // Uses a Serializable interactive transaction via Prisma.
    // Serializable isolation ensures that if two requests read the same
    // stock row simultaneously, only one will commit — the other will
    // be aborted by Postgres with a serialization failure, which Prisma
    // surfaces as an error. This replaces the previous $queryRaw
    // FOR UPDATE approach that was incompatible with Supabase's
    // PgBouncer transaction pooler.
    const reservation = await prisma.$transaction(
      async (tx) => {
        const stock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: { productId, warehouseId },
          },
        });

        if (!stock || stock.total - stock.reserved < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        await tx.stock.update({
          where: {
            productId_warehouseId: { productId, warehouseId },
          },
          data: { reserved: { increment: quantity } },
        });

        return tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            idempotencyKey: idempotencyKey ?? undefined,
          },
          include: { product: true, warehouse: true },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );

    // Cache for idempotency
    if (idempotencyKey) {
      await redis.set(
        `idempotency:${idempotencyKey}`,
        JSON.stringify(reservation),
        { ex: 86400 }
      );
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    if (String(err).includes("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        { error: "Not enough stock available in this warehouse" },
        { status: 409 }
      );
    }
    console.error("[POST /api/reservations] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}
