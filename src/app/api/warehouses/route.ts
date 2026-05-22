import { NextResponse } from "next/server";
import { getWarehouses } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warehouses = await getWarehouses();
    return NextResponse.json(warehouses);
  } catch (err) {
    console.error("Failed to fetch warehouses:", err);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
