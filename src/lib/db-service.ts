// src/lib/db-service.ts
// Database access layer - supports Firebase Firestore with local database store fallback

import { getAdminDb } from "@/src/lib/firebase-admin";
import {
  Order,
  MenuItem,
  Category,
  Table,
  OrderLine,
  OrderStatus,
  isValidStatusTransition,
  StatusHistory,
  DashboardStats,
  TopItem,
} from "@/src/lib/types";

export interface RestaurantSettings {
  restaurantName: string;
  contactEmail: string;
  phoneNumber: string;
  currency: string;
  serviceCharge: number;
  taxRate: number;
  qrOrderingEnabled: boolean;
  openingHours: string;
  branchName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  coverImageUrl?: string;
  logoUrl?: string;
}

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "The Cozy Cafe",
  contactEmail: "contact@cozycafe.com",
  phoneNumber: "+94 11 234 5678",
  currency: "LKR",
  serviceCharge: 10,
  taxRate: 10,
  qrOrderingEnabled: true,
  openingHours: "10:00 AM - 11:00 PM",
  branchName: "Main Branch - Colombo 03",
  address: "No. 42, Galle Road",
  city: "Colombo 03",
  postalCode: "00300",
  country: "Sri Lanka",
  coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
  logoUrl: "/icons/icon-192x192.png",
};

const DEFAULT_TABLES: Table[] = [
  { id: "01", label: "Table 01", seats: 2, isActive: true, qrToken: "TB01_QR", qrUrl: "/t/01", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "02", label: "Table 02", seats: 4, isActive: true, qrToken: "TB02_QR", qrUrl: "/t/02", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "03", label: "Table 03", seats: 4, isActive: true, qrToken: "TB03_QR", qrUrl: "/t/03", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "04", label: "Table 04", seats: 6, isActive: true, qrToken: "TB04_QR", qrUrl: "/t/04", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "05", label: "Table 05", seats: 2, isActive: true, qrToken: "TB05_QR", qrUrl: "/t/05", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "06", label: "Table 06", seats: 4, isActive: true, qrToken: "TB06_QR", qrUrl: "/t/06", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "07", label: "Table 07", seats: 8, isActive: true, qrToken: "TB07_QR", qrUrl: "/t/07", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "08", label: "Table 08", seats: 4, isActive: true, qrToken: "TB08_QR", qrUrl: "/t/08", createdAt: Date.now(), updatedAt: Date.now() },
];

interface MemoryStore {
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  settings?: RestaurantSettings;
}

function getMemoryStore(): MemoryStore {
  const g = globalThis as unknown as { __dinego_store?: MemoryStore };
  if (!g.__dinego_store) {
    g.__dinego_store = {
      categories: [],
      menuItems: [],
      tables: [...DEFAULT_TABLES],
      orders: [],
      settings: { ...DEFAULT_SETTINGS },
    };
  }
  return g.__dinego_store;
}

// ===== ORDERS =====

export async function createOrder(
  tableId: string,
  tableLabel: string,
  qrToken: string,
  sessionId: string,
  lines: OrderLine[],
  tax: number,
  serviceCharge: number,
  createdBy: string = "customer"
): Promise<Order> {
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.lineTotal ?? line.unitPrice * line.qty),
    0
  );
  const total = subtotal + tax + serviceCharge;

  const db = getAdminDb();
  const orderId = db ? db.collection("orders").doc().id : (1001 + getMemoryStore().orders.length).toString();

  const order: Order = {
    id: orderId,
    tableId,
    tableLabel,
    qrToken,
    sessionId,
    status: "RECEIVED",
    lines,
    subtotal,
    serviceCharge,
    tax,
    total,
    statusHistory: [
      {
        status: "RECEIVED",
        changedAt: Date.now(),
        changedBy: createdBy,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  if (db) {
    await db.collection("orders").doc(orderId).set(order);
  } else {
    getMemoryStore().orders.unshift(order);
  }

  return order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("orders").doc(orderId).get();
    return doc.exists ? (doc.data() as Order) : null;
  }
  const store = getMemoryStore();
  const order = store.orders.find((o) => o.id === orderId);
  return order ? { ...order } : null;
}

export async function getOrdersByTableAndStatus(
  tableId: string,
  status?: OrderStatus
): Promise<Order[]> {
  const db = getAdminDb();
  if (db) {
    let query: FirebaseFirestore.Query = db
      .collection("orders")
      .where("tableId", "==", tableId);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Order);
  }

  const store = getMemoryStore();
  const normalized = tableId.trim().toLowerCase();
  return store.orders
    .filter(
      (o) =>
        (o.tableId.toLowerCase() === normalized ||
          o.tableId.padStart(2, "0") === normalized.padStart(2, "0")) &&
        (!status || o.status === status)
    )
    .map((o) => ({ ...o }));
}

export async function getOrdersBySessionId(sessionId: string): Promise<Order[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("orders")
      .where("sessionId", "==", sessionId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as Order);
  }

  const store = getMemoryStore();
  return store.orders
    .filter((o) => o.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((o) => ({ ...o }));
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => doc.data() as Order);
  }

  const store = getMemoryStore();
  return store.orders.slice().sort((a, b) => b.createdAt - a.createdAt).map((o) => ({ ...o }));
}

export async function getOrdersByDateRange(
  startDate: number,
  endDate: number
): Promise<Order[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("orders")
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Order);
  }

  const store = getMemoryStore();
  return store.orders
    .filter((o) => o.createdAt >= startDate && o.createdAt <= endDate)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((o) => ({ ...o }));
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  changedBy: string = "system"
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.status !== newStatus && !isValidStatusTransition(order.status, newStatus)) {
    throw new Error(`Invalid status transition from '${order.status}' to '${newStatus}'`);
  }

  const statusHistory: StatusHistory = {
    status: newStatus,
    changedAt: Date.now(),
    changedBy,
  };

  const updatedOrder: Order = {
    ...order,
    status: newStatus,
    statusHistory: [...(order.statusHistory || []), statusHistory],
    updatedAt: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("orders").doc(orderId).update({
      status: newStatus,
      statusHistory: updatedOrder.statusHistory,
      updatedAt: updatedOrder.updatedAt,
    });
  } else {
    const store = getMemoryStore();
    const idx = store.orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      store.orders[idx] = updatedOrder;
    }
  }

  return updatedOrder;
}

// ===== MENU ITEMS =====

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db.collection("menuItems").orderBy("sortOrder", "asc").get();
    return snapshot.docs.map((doc) => doc.data() as MenuItem);
  }

  const store = getMemoryStore();
  return store.menuItems.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("menuItems").doc(id).get();
    return doc.exists ? (doc.data() as MenuItem) : null;
  }

  const store = getMemoryStore();
  const item = store.menuItems.find((m) => m.id === id);
  return item ? { ...item } : null;
}

export async function createMenuItem(
  data: Omit<MenuItem, "id">,
  createdBy: string = "owner"
): Promise<MenuItem> {
  const db = getAdminDb();
  const id = db ? db.collection("menuItems").doc().id : `item_${Date.now()}`;

  const menuItem: MenuItem = {
    ...data,
    id,
    sortOrder: data.sortOrder ?? 0,
    isAvailable: data.isAvailable ?? true,
    variants: data.variants || [],
  };

  if (db) {
    await db.collection("menuItems").doc(id).set(menuItem);
  } else {
    getMemoryStore().menuItems.push(menuItem);
  }

  return menuItem;
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id">>,
  updatedBy: string = "owner"
): Promise<MenuItem> {
  const item = await getMenuItemById(id);
  if (!item) throw new Error("MenuItem not found");

  const updated: MenuItem = {
    ...item,
    ...data,
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("menuItems").doc(id).update(data);
  } else {
    const store = getMemoryStore();
    const idx = store.menuItems.findIndex((m) => m.id === id);
    if (idx !== -1) {
      store.menuItems[idx] = updated;
    }
  }

  return updated;
}

export async function deleteMenuItem(id: string, deletedBy: string = "owner"): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("menuItems").doc(id).delete();
  } else {
    const store = getMemoryStore();
    store.menuItems = store.menuItems.filter((m) => m.id !== id);
  }
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db.collection("categories").orderBy("sortOrder", "asc").get();
    return snapshot.docs.map((doc) => doc.data() as Category);
  }

  const store = getMemoryStore();
  return store.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("categories").doc(id).get();
    return doc.exists ? (doc.data() as Category) : null;
  }

  const store = getMemoryStore();
  const cat = store.categories.find((c) => c.id === id);
  return cat ? { ...cat } : null;
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  createdBy: string = "owner"
): Promise<Category> {
  const db = getAdminDb();
  const id = db ? db.collection("categories").doc().id : `cat_${Date.now()}`;

  const category: Category = {
    ...data,
    id,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (db) {
    await db.collection("categories").doc(id).set(category);
  } else {
    getMemoryStore().categories.push(category);
  }

  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id">>,
  updatedBy: string = "owner"
): Promise<Category> {
  const cat = await getCategoryById(id);
  if (!cat) throw new Error("Category not found");

  const updated: Category = {
    ...cat,
    ...data,
    updatedAt: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("categories").doc(id).update({
      ...data,
      updatedAt: Date.now(),
    });
  } else {
    const store = getMemoryStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      store.categories[idx] = updated;
    }
  }

  return updated;
}

export async function deleteCategory(id: string, deletedBy: string = "owner"): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("categories").doc(id).delete();
  } else {
    const store = getMemoryStore();
    store.categories = store.categories.filter((c) => c.id !== id);
  }
}

// ===== TABLES =====

export async function getTables(): Promise<Table[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db.collection("tables").orderBy("label", "asc").get();
    return snapshot.docs.map((doc) => doc.data() as Table);
  }

  const store = getMemoryStore();
  return store.tables.slice();
}

export async function getTableById(id: string): Promise<Table | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("tables").doc(id).get();
    return doc.exists ? (doc.data() as Table) : null;
  }

  const store = getMemoryStore();
  const table = store.tables.find(
    (t) => t.id === id || t.id === id.padStart(2, "0") || t.id.padStart(2, "0") === id.padStart(2, "0")
  );
  return table ? { ...table } : null;
}

export async function getTableByQRToken(token: string): Promise<Table | null> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db.collection("tables").where("qrToken", "==", token).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Table;
  }

  const store = getMemoryStore();
  const table = store.tables.find((t) => t.qrToken === token);
  return table ? { ...table } : null;
}

export async function createTable(
  data: Omit<Table, "id" | "createdAt" | "updatedAt">,
  createdBy: string = "owner"
): Promise<Table> {
  const db = getAdminDb();
  const id = db ? db.collection("tables").doc().id : `t_${Date.now()}`;

  const table: Table = {
    ...data,
    id,
    isActive: data.isActive ?? true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (db) {
    await db.collection("tables").doc(id).set(table);
  } else {
    getMemoryStore().tables.push(table);
  }

  return table;
}

export async function updateTable(
  id: string,
  data: Partial<Omit<Table, "id">>,
  updatedBy: string = "owner"
): Promise<Table> {
  const table = await getTableById(id);
  if (!table) throw new Error("Table not found");

  const updated: Table = {
    ...table,
    ...data,
    updatedAt: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("tables").doc(id).update({
      ...data,
      updatedAt: Date.now(),
    });
  } else {
    const store = getMemoryStore();
    const idx = store.tables.findIndex((t) => t.id === id);
    if (idx !== -1) {
      store.tables[idx] = updated;
    }
  }

  return updated;
}

export async function deleteTable(id: string, deletedBy: string = "owner"): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("tables").doc(id).delete();
  } else {
    const store = getMemoryStore();
    store.tables = store.tables.filter((t) => t.id !== id);
  }
}

export function generateQRToken(tableId: string): string {
  return `TB${tableId.padStart(2, "0")}_QR`;
}

// ===== RESTAURANT SETTINGS =====

export async function getSettings(): Promise<RestaurantSettings> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("settings").doc("restaurant_settings").get();
    if (doc.exists) {
      return doc.data() as RestaurantSettings;
    }
  }

  const store = getMemoryStore();
  return store.settings || DEFAULT_SETTINGS;
}

export async function updateSettings(
  data: Partial<RestaurantSettings>,
  updatedBy: string = "owner"
): Promise<RestaurantSettings> {
  const current = await getSettings();
  const updated: RestaurantSettings = {
    ...current,
    ...data,
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("settings").doc("restaurant_settings").set(updated, { merge: true });
  } else {
    const store = getMemoryStore();
    store.settings = updated;
  }

  return updated;
}

export const getRestaurantSettings = getSettings;
export const updateRestaurantSettings = (data: Partial<RestaurantSettings>, updatedBy: string = "owner") =>
  updateSettings(data, updatedBy);

// ===== ANALYTICS & DASHBOARD =====

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = await getAllOrders();
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => o.createdAt >= startOfDay);
  const completedOrders = todayOrders.filter((o) => o.status === "COMPLETED" || o.status === "SERVED");
  const pendingOrders = todayOrders.filter((o) => o.status === "RECEIVED" || o.status === "PREPARING");

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  return {
    totalOrders: todayOrders.length,
    totalRevenue,
    averageOrderValue,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    dateRange: {
      start: startOfDay,
      end: now,
    },
  };
}

export async function getTopItemsReport(limitCount: number = 5): Promise<TopItem[]> {
  const orders = await getAllOrders();
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    for (const line of order.lines) {
      if (!itemMap[line.itemId]) {
        itemMap[line.itemId] = { name: line.name, qty: 0, revenue: 0 };
      }
      itemMap[line.itemId].qty += line.qty;
      itemMap[line.itemId].revenue += line.lineTotal ?? line.unitPrice * line.qty;
    }
  }

  const items = Object.entries(itemMap).map(([itemId, val]) => ({
    itemId,
    name: val.name,
    qty: val.qty,
    revenue: val.revenue,
    trend: "up" as const,
  }));

  items.sort((a, b) => b.qty - a.qty);
  return items.slice(0, limitCount);
}

export const getTopItems = getTopItemsReport;