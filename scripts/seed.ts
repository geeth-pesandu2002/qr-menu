import { config } from "dotenv";
config({ path: ".env.local" });

const categories = [
  { id: "rice", name: "Rice & Kottu", sortOrder: 1 },
  { id: "short-eats", name: "Short Eats", sortOrder: 2 },
  { id: "beverages", name: "Beverages", sortOrder: 3 },
  { id: "desserts", name: "Desserts", sortOrder: 4 },
];

const items = [
  { name: "Chicken Kottu", description: "Classic chopped roti with chicken", price: 85000, categoryId: "rice", variants: [] },
  { name: "Cheese Kottu", description: "Kottu with melted cheese", price: 110000, categoryId: "rice", variants: [] },
  { name: "Fried Rice", description: "Mixed fried rice", price: 75000, categoryId: "rice", variants: [] },
  { name: "Fish Bun", description: "Soft bun with spiced fish", price: 12000, categoryId: "short-eats", variants: [] },
  { name: "Egg Roti", description: "Roti stuffed with egg", price: 18000, categoryId: "short-eats", variants: [] },
  { name: "Plain Tea", description: "Ceylon black tea", price: 8000, categoryId: "beverages",
    variants: [{ label: "Regular", price: 8000 }, { label: "Large", price: 12000 }] },
  { name: "Milk Coffee", description: "Hot milk coffee", price: 15000, categoryId: "beverages",
    variants: [{ label: "Regular", price: 15000 }, { label: "Large", price: 20000 }] },
  { name: "Watalappan", description: "Traditional coconut custard", price: 35000, categoryId: "desserts", variants: [] },
];

const tables = Array.from({ length: 8 }, (_, i) => ({
  id: `t${i + 1}`,
  label: `Table ${i + 1}`,
  isActive: true,
}));

async function seed() {
  const { getAdminDb } = await import("../src/lib/firebase-admin");
  const adminDb = getAdminDb();
  const batch = adminDb.batch();

  categories.forEach((c) =>
    batch.set(adminDb.collection("categories").doc(c.id), c)
  );

  items.forEach((item, i) =>
    batch.set(adminDb.collection("menuItems").doc(), {
      ...item,
      imageUrl: null,
      isAvailable: true,
      sortOrder: i,
    })
  );

  tables.forEach((t) =>
    batch.set(adminDb.collection("tables").doc(t.id), t)
  );

  await batch.commit();
  console.log(`Seeded ${categories.length} categories, ${items.length} items, ${tables.length} tables`);
}

seed().then(() => process.exit(0));