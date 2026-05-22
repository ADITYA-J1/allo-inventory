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

    // THE CORE CONCURRENCY-SAFE PATTERN
    // SELECT ... FOR UPDATE acquires a row-level lock on the Stock row.
    // The check and the update happen in one atomic SQL statement.
    // Two simultaneous requests for the last unit: one gets the lock,
    // the other waits. When the second evaluates the WHERE clause,
    // reserved has already been incremented — it fails cleanly → 409.
    const result = await prisma.$queryRaw<{ success: boolean }[]>`
      WITH locked AS (
        SELECT id, total, reserved
        FROM "Stock"
        WHERE "productId" = ${productId}
          AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      ),
      updated AS (
        UPDATE "Stock"
        SET reserved = reserved + ${quantity}
        FROM locked
        WHERE "Stock".id = locked.id
          AND (locked.total - locked.reserved) >= ${quantity}
        RETURNING "Stock".id
      )
      SELECT EXISTS (SELECT 1 FROM updated) AS success
    `;

    if (!result[0]?.success) {
      return NextResponse.json(
        { error: "Not enough stock available in this warehouse" },
        { status: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        idempotencyKey: idempotencyKey ?? undefined,
      },
      include: { product: true, warehouse: true },
    });

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
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
