import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (reservation.status !== "PENDING" || reservation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 410 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: { product: true, warehouse: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Confirm error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
