import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stock: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      createdAt: product.createdAt,
      stock: product.stock.map((s) => ({
        warehouseId: s.warehouseId,
        warehouseName: s.warehouse.name,
        total: s.total,
        reserved: s.reserved,
        available: s.total - s.reserved,
      })),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
