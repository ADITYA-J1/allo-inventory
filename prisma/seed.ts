import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order
  await prisma.reservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Warehouses — keep same IDs so env vars still work
  const delhi = await prisma.warehouse.create({
    data: { id: "wh-delhi", name: "Delhi Central", location: "New Delhi, IN" },
  });
  const mumbai = await prisma.warehouse.create({
    data: { id: "wh-mumbai", name: "Mumbai West", location: "Mumbai, IN" },
  });
  const bangalore = await prisma.warehouse.create({
    data: {
      id: "wh-bangalore",
      name: "Bangalore Hub",
      location: "Bangalore, IN",
    },
  });

  console.log("Warehouses:", delhi.name, mumbai.name, bangalore.name);

  // Products — realistic Allo-style health catalog
  const products = [
    // Haircare
    {
      id: "HR-001",
      name: "Minoxidil 5% Foam",
      sku: "HRF-001",
      description:
        "Clinically proven topical treatment for androgenetic alopecia. Stimulates hair follicles and promotes regrowth.",
      category: "Haircare",
      price: 899,
    },
    {
      id: "HR-002",
      name: "Hair Growth Serum",
      sku: "HRF-003",
      description:
        "Peptide-enriched scalp serum with redensyl and anagain. Reduces shedding and strengthens hair shaft.",
      category: "Haircare",
      price: 649,
    },
    {
      id: "HR-003",
      name: "Anti Hair Fall Shampoo",
      sku: "HRF-004",
      description:
        "Biotin and keratin fortified shampoo. Sulfate-free, pH balanced for daily use.",
      category: "Haircare",
      price: 399,
    },
    // Skincare
    {
      id: "SK-001",
      name: "Cetaphil Gentle Cleanser",
      sku: "SKN-001",
      description:
        "Non-comedogenic, fragrance-free face wash. Suitable for sensitive and acne-prone skin.",
      category: "Skincare",
      price: 549,
    },
    {
      id: "SK-002",
      name: "Niacinamide 10% Serum",
      sku: "SKN-004",
      description:
        "High-strength niacinamide with zinc PCA. Minimises pores, controls sebum, and fades blemishes.",
      category: "Skincare",
      price: 799,
    },
    {
      id: "SK-003",
      name: "Sunscreen SPF 50 PA+++",
      sku: "SKN-005",
      description:
        "Broad spectrum UV protection. Lightweight, non-greasy formula with no white cast.",
      category: "Skincare",
      price: 449,
    },
    // Wellness
    {
      id: "WL-001",
      name: "Ashwagandha KSM-66",
      sku: "WLN-001",
      description:
        "Full-spectrum root extract standardised to 5% withanolides. Clinically studied for stress and cortisol management.",
      category: "Wellness",
      price: 699,
    },
    {
      id: "WL-002",
      name: "Magnesium Glycinate",
      sku: "WLN-002",
      description:
        "Highly bioavailable magnesium chelate. Supports sleep quality, muscle recovery, and nervous system function.",
      category: "Wellness",
      price: 599,
    },
    {
      id: "WL-003",
      name: "Sleep Support Gummies",
      sku: "WLN-004",
      description:
        "Melatonin-free formula with L-theanine, chamomile, and passionflower. Non-habit forming.",
      category: "Wellness",
      price: 749,
    },
    {
      id: "WL-004",
      name: "Daily Multivitamin",
      sku: "WLN-005",
      description:
        "23 essential nutrients tailored for metabolic and hormonal health in men. No fillers, no unnecessary additives.",
      category: "Wellness",
      price: 849,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Stock — realistic varied levels, HR-001 in Delhi has 1 unit for concurrency demo
  const stockData = [
    { productId: "HR-001", warehouseId: "wh-delhi", total: 1, reserved: 0 },
    { productId: "HR-001", warehouseId: "wh-mumbai", total: 18, reserved: 0 },
    {
      productId: "HR-001",
      warehouseId: "wh-bangalore",
      total: 7,
      reserved: 0,
    },
    { productId: "HR-002", warehouseId: "wh-delhi", total: 12, reserved: 0 },
    { productId: "HR-002", warehouseId: "wh-mumbai", total: 0, reserved: 0 },
    {
      productId: "HR-002",
      warehouseId: "wh-bangalore",
      total: 5,
      reserved: 0,
    },
    { productId: "HR-003", warehouseId: "wh-delhi", total: 34, reserved: 0 },
    { productId: "HR-003", warehouseId: "wh-mumbai", total: 22, reserved: 0 },
    {
      productId: "HR-003",
      warehouseId: "wh-bangalore",
      total: 0,
      reserved: 0,
    },
    { productId: "SK-001", warehouseId: "wh-delhi", total: 8, reserved: 0 },
    { productId: "SK-001", warehouseId: "wh-mumbai", total: 15, reserved: 0 },
    {
      productId: "SK-001",
      warehouseId: "wh-bangalore",
      total: 3,
      reserved: 0,
    },
    { productId: "SK-002", warehouseId: "wh-delhi", total: 0, reserved: 0 },
    { productId: "SK-002", warehouseId: "wh-mumbai", total: 9, reserved: 0 },
    {
      productId: "SK-002",
      warehouseId: "wh-bangalore",
      total: 11,
      reserved: 0,
    },
    { productId: "SK-003", warehouseId: "wh-delhi", total: 27, reserved: 0 },
    { productId: "SK-003", warehouseId: "wh-mumbai", total: 4, reserved: 0 },
    {
      productId: "SK-003",
      warehouseId: "wh-bangalore",
      total: 19,
      reserved: 0,
    },
    { productId: "WL-001", warehouseId: "wh-delhi", total: 6, reserved: 0 },
    { productId: "WL-001", warehouseId: "wh-mumbai", total: 14, reserved: 0 },
    {
      productId: "WL-001",
      warehouseId: "wh-bangalore",
      total: 0,
      reserved: 0,
    },
    { productId: "WL-002", warehouseId: "wh-delhi", total: 20, reserved: 0 },
    { productId: "WL-002", warehouseId: "wh-mumbai", total: 0, reserved: 0 },
    {
      productId: "WL-002",
      warehouseId: "wh-bangalore",
      total: 8,
      reserved: 0,
    },
    { productId: "WL-003", warehouseId: "wh-delhi", total: 3, reserved: 0 },
    { productId: "WL-003", warehouseId: "wh-mumbai", total: 16, reserved: 0 },
    {
      productId: "WL-003",
      warehouseId: "wh-bangalore",
      total: 5,
      reserved: 0,
    },
    { productId: "WL-004", warehouseId: "wh-delhi", total: 42, reserved: 0 },
    { productId: "WL-004", warehouseId: "wh-mumbai", total: 31, reserved: 0 },
    {
      productId: "WL-004",
      warehouseId: "wh-bangalore",
      total: 17,
      reserved: 0,
    },
  ];

  for (const s of stockData) {
    await prisma.stock.create({ data: s });
  }

  console.log(
    "✅ Seed complete — 10 products, 3 warehouses, 30 stock entries"
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
