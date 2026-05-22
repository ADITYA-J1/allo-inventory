import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Warehouses
  const delhi = await prisma.warehouse.upsert({
    where: { id: "wh-delhi" },
    update: {},
    create: { id: "wh-delhi", name: "Delhi Central", location: "New Delhi, IN" },
  });
  const mumbai = await prisma.warehouse.upsert({
    where: { id: "wh-mumbai" },
    update: {},
    create: { id: "wh-mumbai", name: "Mumbai West", location: "Mumbai, IN" },
  });
  const bangalore = await prisma.warehouse.upsert({
    where: { id: "wh-bangalore" },
    update: {},
    create: { id: "wh-bangalore", name: "Bangalore Hub", location: "Bangalore, IN" },
  });

  console.log("Warehouses:", delhi.name, mumbai.name, bangalore.name);

  // Products
  const products = [
    { id: "prod-001", name: "Testosterone Support Complex", sku: "TSC-001", description: "Clinically formulated testosterone support with zinc, ashwagandha & vitamin D3." },
    { id: "prod-002", name: "Sleep & Recovery Formula", sku: "SRF-002", description: "Melatonin-free sleep aid with magnesium glycinate and L-theanine." },
    { id: "prod-003", name: "Men's Daily Essentials", sku: "MDE-003", description: "Complete multivitamin stack tailored for metabolic and hormonal health." },
    { id: "prod-004", name: "Stress & Cortisol Control", sku: "SCC-004", description: "Adaptogen blend with ashwagandha KSM-66, rhodiola, and phosphatidylserine." },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Stock levels — intentionally varied, prod-001 in delhi has only 1 unit (for concurrency demo)
  const stockData = [
    { productId: "prod-001", warehouseId: "wh-delhi",     total: 1,  reserved: 0 },
    { productId: "prod-001", warehouseId: "wh-mumbai",    total: 24, reserved: 0 },
    { productId: "prod-001", warehouseId: "wh-bangalore", total: 8,  reserved: 0 },
    { productId: "prod-002", warehouseId: "wh-delhi",     total: 15, reserved: 0 },
    { productId: "prod-002", warehouseId: "wh-mumbai",    total: 0,  reserved: 0 },
    { productId: "prod-002", warehouseId: "wh-bangalore", total: 3,  reserved: 0 },
    { productId: "prod-003", warehouseId: "wh-delhi",     total: 42, reserved: 0 },
    { productId: "prod-003", warehouseId: "wh-mumbai",    total: 18, reserved: 0 },
    { productId: "prod-003", warehouseId: "wh-bangalore", total: 0,  reserved: 0 },
    { productId: "prod-004", warehouseId: "wh-delhi",     total: 7,  reserved: 0 },
    { productId: "prod-004", warehouseId: "wh-mumbai",    total: 5,  reserved: 0 },
    { productId: "prod-004", warehouseId: "wh-bangalore", total: 11, reserved: 0 },
  ];

  for (const s of stockData) {
    await prisma.stock.upsert({
      where: { productId_warehouseId: { productId: s.productId, warehouseId: s.warehouseId } },
      update: {},
      create: s,
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
