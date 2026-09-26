// src/lib/db-service.ts
// Database access layer - supports Firebase Firestore with in-memory fallback store

import { getAdminDb } from "@/lib/firebase-admin";
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
} from "@/lib/types";
import { mockCategories, mockMenuItems, mockTables, mockInitialOrders } from "@/src/mock/menuData";

// ===== IN-MEMORY DUAL-MODE DATA STORE =====
interface MemoryStore {
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
}

function getMemoryStore(): MemoryStore {
  const g = globalThis as unknown as { __dinego_store?: MemoryStore };
  if (!g.__dinego_store) {
    g.__dinego_store = {
      categories: [...mockCategories],
      menuItems: [...mockMenuItems],
      tables: [...mockTables],
      orders: [...(mockInitialOrders as Order[])],
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
  createdBy: string
): Promise<Order> {
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.lineTotal ?? line.unitPrice * line.qty),
    0
  );
  const total = subtotal + tax + serviceCharge;

  const db = getAdminDb();
  const orderId = db ? db.collection("orders").doc().id : (1020 + getMemoryStore().orders.length + 1).toString();

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
    estimatedMinutes: 15,
  };

  if (db) {
    await db.collection("orders").doc(orderId).set(order);
  } else {
    const store = getMemoryStore();
    store.orders.unshift(order);
  }

  return order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("orders").doc(orderId).get();
    return (doc.data() as Order) || null;
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
  changedBy: string
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.status !== newStatus && !isValidStatusTransition(order.status, newStatus)) {
    console.warn(`Status transition from ${order.status} to ${newStatus} allowed in flexible mode`);
  }

  const statusHistory: StatusHistory = {
    status: newStatus,
    changedAt: Date.now(),
    changedBy,
  };

  const updatedHistory = [...(order.statusHistory || []), statusHistory];
  const updatedAt = Date.now();

  const db = getAdminDb();
  if (db) {
    await db.collection("orders").doc(orderId).update({
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt,
    });
    return (await getOrderById(orderId)) as Order;
  }

  const store = getMemoryStore();
  const idx = store.orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    store.orders[idx] = {
      ...store.orders[idx],
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt,
    };
    return { ...store.orders[idx] };
  }

  return order;
}

// ===== MENU ITEMS =====

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("menuItems")
      .orderBy("sortOrder", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as MenuItem);
  }

  const store = getMemoryStore();
  return store.menuItems.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMenuItemById(itemId: string): Promise<MenuItem | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("menuItems").doc(itemId).get();
    return (doc.data() as MenuItem) || null;
  }

  const store = getMemoryStore();
  const item = store.menuItems.find((i) => i.id === itemId);
  return item ? { ...item } : null;
}

export async function createMenuItem(
  item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<MenuItem> {
  const db = getAdminDb();
  const id = db ? db.collection("menuItems").doc().id : `item_${Date.now()}`;

  const newItem: MenuItem = {
    ...item,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  if (db) {
    await db.collection("menuItems").doc(id).set(newItem);
  } else {
    getMemoryStore().menuItems.push(newItem);
  }

  return newItem;
}

export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<MenuItem> {
  const db = getAdminDb();
  if (db) {
    await db
      .collection("menuItems")
      .doc(itemId)
      .update({
        ...updates,
        updatedAt: Date.now(),
      });

    return (await getMenuItemById(itemId)) as MenuItem;
  }

  const store = getMemoryStore();
  const idx = store.menuItems.findIndex((i) => i.id === itemId);
  if (idx !== -1) {
    store.menuItems[idx] = {
      ...store.menuItems[idx],
      ...updates,
      updatedAt: Date.now(),
    };
    return { ...store.menuItems[idx] };
  }

  throw new Error("Menu item not found");
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("menuItems").doc(itemId).delete();
    return;
  }

  const store = getMemoryStore();
  store.menuItems = store.menuItems.filter((i) => i.id !== itemId);
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("categories")
      .orderBy("sortOrder", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Category);
  }

  const store = getMemoryStore();
  return store.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("categories").doc(categoryId).get();
    return (doc.data() as Category) || null;
  }

  const store = getMemoryStore();
  const cat = store.categories.find((c) => c.id === categoryId);
  return cat ? { ...cat } : null;
}

export async function createCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Category> {
  const db = getAdminDb();
  const id = db ? db.collection("categories").doc().id : `cat_${Date.now()}`;

  const newCategory: Category = {
    ...category,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  if (db) {
    await db.collection("categories").doc(id).set(newCategory);
  } else {
    getMemoryStore().categories.push(newCategory);
  }

  return newCategory;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Category>
): Promise<Category> {
  const db = getAdminDb();
  if (db) {
    await db
      .collection("categories")
      .doc(categoryId)
      .update({
        ...updates,
        updatedAt: Date.now(),
      });

    return (await getCategoryById(categoryId)) as Category;
  }

  const store = getMemoryStore();
  const idx = store.categories.findIndex((c) => c.id === categoryId);
  if (idx !== -1) {
    store.categories[idx] = {
      ...store.categories[idx],
      ...updates,
      updatedAt: Date.now(),
    };
    return { ...store.categories[idx] };
  }

  throw new Error("Category not found");
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("categories").doc(categoryId).delete();
    return;
  }

  const store = getMemoryStore();
  store.categories = store.categories.filter((c) => c.id !== categoryId);
}

// ===== TABLES =====

export async function getTables(): Promise<Table[]> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("tables")
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Table);
  }

  const store = getMemoryStore();
  return store.tables.slice();
}

export async function getTableByQRToken(qrToken: string): Promise<Table | null> {
  const db = getAdminDb();
  if (db) {
    const snapshot = await db
      .collection("tables")
      .where("qrToken", "==", qrToken)
      .limit(1)
      .get();

    if (!snapshot.empty) return snapshot.docs[0].data() as Table;
  }

  const store = getMemoryStore();
  const normalized = qrToken.trim().toLowerCase();
  const found = store.tables.find(
    (t) =>
      t.qrToken?.toLowerCase() === normalized ||
      t.id.toLowerCase() === normalized ||
      t.id.padStart(2, "0") === normalized.padStart(2, "0") ||
      t.label.toLowerCase() === normalized
  );

  return found ? { ...found } : null;
}

export async function getTableById(tableId: string): Promise<Table | null> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("tables").doc(tableId).get();
    if (doc.exists) return doc.data() as Table;
  }

  const store = getMemoryStore();
  const normalized = tableId.trim().toLowerCase();
  const found = store.tables.find(
    (t) =>
      t.id.toLowerCase() === normalized ||
      t.id.padStart(2, "0") === normalized.padStart(2, "0") ||
      t.label.toLowerCase() === normalized ||
      t.qrToken?.toLowerCase() === normalized
  );

  return found ? { ...found } : null;
}

export async function createTable(
  table: Omit<Table, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Table> {
  const db = getAdminDb();
  const id = db ? db.collection("tables").doc().id : `tbl_${Date.now()}`;

  const newTable: Table = {
    ...table,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  if (db) {
    await db.collection("tables").doc(id).set(newTable);
  } else {
    getMemoryStore().tables.push(newTable);
  }

  return newTable;
}

export async function updateTable(
  tableId: string,
  updates: Partial<Table>
): Promise<Table> {
  const db = getAdminDb();
  if (db) {
    await db
      .collection("tables")
      .doc(tableId)
      .update({
        ...updates,
        updatedAt: Date.now(),
      });

    return (await getTableById(tableId)) as Table;
  }

  const store = getMemoryStore();
  const idx = store.tables.findIndex((t) => t.id === tableId);
  if (idx !== -1) {
    store.tables[idx] = {
      ...store.tables[idx],
      ...updates,
      updatedAt: Date.now(),
    };
    return { ...store.tables[idx] };
  }

  throw new Error("Table not found");
}

export async function deleteTable(tableId: string): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection("tables").doc(tableId).delete();
    return;
  }

  const store = getMemoryStore();
  store.tables = store.tables.filter((t) => t.id !== tableId);
}

// ===== ANALYTICS =====

export async function getDashboardStats(
  startDate: number,
  endDate: number
): Promise<DashboardStats> {
  const orders = await getOrdersByDateRange(startDate, endDate);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    completedOrders,
    pendingOrders,
    dateRange: { start: startDate, end: endDate },
  };
}

export async function getTopItems(
  startDate: number,
  endDate: number,
  limit: number = 10
): Promise<TopItem[]> {
  const orders = await getOrdersByDateRange(startDate, endDate);

  // Aggregate items
  const itemMap = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();

  for (const order of orders) {
    for (const line of order.lines) {
      const key = line.itemId;
      const existing = itemMap.get(key) || {
        name: line.name,
        qty: 0,
        revenue: 0,
      };

      existing.qty += line.qty;
      existing.revenue += line.lineTotal ?? line.unitPrice * line.qty;

      itemMap.set(key, existing);
    }
  }

  // Convert to array and sort by revenue
  const topItems = Array.from(itemMap.entries())
    .map(([itemId, data]) => ({
      itemId,
      name: data.name,
      qty: data.qty,
      revenue: data.revenue,
      trend: "stable" as const,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return topItems;
}

// ===== UTILITIES =====

/**
 * Generate a unique QR token (10 random chars)
 */
export function generateQRToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}