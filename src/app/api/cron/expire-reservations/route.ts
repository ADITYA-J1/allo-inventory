import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
    select: { id: true, productId: true, warehouseId: true, quantity: true },
  });

  if (expired.length === 0) return NextResponse.json({ released: 0 });

  await prisma.$transaction(async (tx) => {
    for (const r of expired) {
      await tx.reservation.update({
        where: { id: r.id },
        data: { status: "RELEASED", releasedAt: now },
      });
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: r.productId,
            warehouseId: r.warehouseId,
          },
        },
        data: { reserved: { decrement: r.quantity } },
      });
    }
  });

  return NextResponse.json({ released: expired.length });
}
