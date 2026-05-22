import { prisma } from "./prisma";

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      stock: {
        include: { warehouse: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return products.map((product) => ({
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
}

export async function getWarehouses() {
  return prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      location: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
