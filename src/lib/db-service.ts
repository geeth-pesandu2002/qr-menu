// src/lib/db-service.ts
// Database access layer - Firestore as sole source of truth

import { getAdminDb } from "@/src/lib/firebase-admin";
import {
  Order,
  MenuItem,
  Category,
  Table,
  OrderLine,
  OrderStatus,
  isValidStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
  StatusHistory,
  DashboardStats,
  TopItem,
} from "@/src/lib/types";

// ===== RESTAURANT SETTINGS TYPES & DEFAULTS =====
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
  const docRef = db.collection("orders").doc();
  const orderId = docRef.id;

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

  await docRef.set(order);

  return order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = getAdminDb();
  const doc = await db.collection("orders").doc(orderId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data() as Order;
  return { ...data, id: data.id || doc.id };
}

export async function getOrdersByTableAndStatus(
  tableId: string,
  status?: OrderStatus
): Promise<Order[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db
    .collection("orders")
    .where("tableId", "==", tableId);

  if (status) {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: data.id || doc.id };
  });
}

export async function getOrdersBySessionId(sessionId: string): Promise<Order[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("orders")
    .where("sessionId", "==", sessionId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: data.id || doc.id };
  });
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getAdminDb();
  const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: data.id || doc.id };
  });
}

export async function getOrdersByDateRange(
  startDate: number,
  endDate: number
): Promise<Order[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("orders")
    .where("createdAt", ">=", startDate)
    .where("createdAt", "<=", endDate)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: data.id || doc.id };
  });
}

export class StatusTransitionError extends Error {
  constructor(
    public currentStatus: OrderStatus,
    public requestedStatus: OrderStatus,
    message?: string
  ) {
    super(
      message ||
        `Invalid order status transition from '${currentStatus}' to '${requestedStatus}'.`
    );
    this.name = "StatusTransitionError";
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  changedBy: string
): Promise<Order> {
  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(orderId);
  const doc = await orderRef.get();
  if (!doc.exists) {
    throw new Error("Order not found");
  }

  const order = doc.data() as Order;

  if (!isValidStatusTransition(order.status, newStatus)) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    const allowedStr =
      allowed.length > 0 ? allowed.join(", ") : "none (terminal state)";
    throw new StatusTransitionError(
      order.status,
      newStatus,
      `Invalid order status transition from '${order.status}' to '${newStatus}'. Allowed transitions from '${order.status}': [${allowedStr}].`
    );
  }

  const statusHistory: StatusHistory = {
    status: newStatus,
    changedAt: Date.now(),
    changedBy,
  };

  const updatedHistory = [...(order.statusHistory || []), statusHistory];
  const updatedAt = Date.now();

  await orderRef.update({
    status: newStatus,
    statusHistory: updatedHistory,
    updatedAt,
  });

  return {
    ...order,
    id: order.id || doc.id,
    status: newStatus,
    statusHistory: updatedHistory,
    updatedAt,
  };
}

// ===== MENU ITEMS =====

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("menuItems")
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as MenuItem;
    return {
      ...data,
      id: data.id || doc.id,
    };
  });
}

export async function getMenuItemById(itemId: string): Promise<MenuItem | null> {
  const db = getAdminDb();
  const doc = await db.collection("menuItems").doc(itemId).get();
  if (doc.exists) {
    const data = doc.data() as MenuItem;
    return {
      ...data,
      id: data.id || doc.id,
    };
  }

  // Also check if stored field 'id' matches
  const snapshot = await db
    .collection("menuItems")
    .where("id", "==", itemId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const match = snapshot.docs[0];
    const data = match.data() as MenuItem;
    return {
      ...data,
      id: data.id || match.id,
    };
  }

  return null;
}

export async function createMenuItem(
  item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<MenuItem> {
  const db = getAdminDb();
  const docRef = db.collection("menuItems").doc();
  const id = docRef.id;

  const newItem: MenuItem = {
    ...item,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await docRef.set(newItem);
  return newItem;
}

export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<MenuItem> {
  const db = getAdminDb();
  const docRef = db.collection("menuItems").doc(itemId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Menu item not found");
  }

  const updatedAt = Date.now();
  await docRef.update({
    ...updates,
    updatedAt,
  });

  const updatedDoc = await docRef.get();
  const data = updatedDoc.data() as MenuItem;
  return {
    ...data,
    id: data.id || updatedDoc.id,
  };
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection("menuItems").doc(itemId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Menu item not found");
  }
  await docRef.delete();
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("categories")
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Category;
    return {
      ...data,
      id: data.id || doc.id,
    };
  });
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const db = getAdminDb();
  const doc = await db.collection("categories").doc(categoryId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data() as Category;
  return {
    ...data,
    id: data.id || doc.id,
  };
}

export async function createCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Category> {
  const db = getAdminDb();
  const docRef = db.collection("categories").doc();
  const id = docRef.id;

  const newCategory: Category = {
    ...category,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await docRef.set(newCategory);
  return newCategory;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Category>
): Promise<Category> {
  const db = getAdminDb();
  const docRef = db.collection("categories").doc(categoryId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Category not found");
  }

  const updatedAt = Date.now();
  await docRef.update({
    ...updates,
    updatedAt,
  });

  const updatedDoc = await docRef.get();
  const data = updatedDoc.data() as Category;
  return {
    ...data,
    id: data.id || updatedDoc.id,
  };
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection("categories").doc(categoryId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Category not found");
  }
  await docRef.delete();
}

// ===== TABLES =====

export async function getTables(): Promise<Table[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("tables")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Table;
    return {
      ...data,
      id: data.id || doc.id,
    };
  });
}

export async function getTableByQRToken(qrToken: string): Promise<Table | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("tables")
    .where("qrToken", "==", qrToken)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const data = doc.data() as Table;
    return { ...data, id: data.id || doc.id };
  }

  // Fallback to direct document id lookup if token matches table id
  const doc = await db.collection("tables").doc(qrToken).get();
  if (doc.exists) {
    const data = doc.data() as Table;
    return { ...data, id: data.id || doc.id };
  }

  return null;
}

export async function getTableById(tableId: string): Promise<Table | null> {
  const db = getAdminDb();
  const doc = await db.collection("tables").doc(tableId).get();
  if (doc.exists) {
    const data = doc.data() as Table;
    return { ...data, id: data.id || doc.id };
  }

  // Also check if stored field 'id' matches
  const snapshot = await db
    .collection("tables")
    .where("id", "==", tableId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const match = snapshot.docs[0];
    const data = match.data() as Table;
    return { ...data, id: data.id || match.id };
  }

  return null;
}

export async function createTable(
  table: Omit<Table, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Table> {
  const db = getAdminDb();
  const docRef = db.collection("tables").doc();
  const id = docRef.id;

  const newTable: Table = {
    ...table,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await docRef.set(newTable);
  return newTable;
}

export async function updateTable(
  tableId: string,
  updates: Partial<Table>
): Promise<Table> {
  const db = getAdminDb();
  const docRef = db.collection("tables").doc(tableId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Table not found");
  }

  const updatedAt = Date.now();
  await docRef.update({
    ...updates,
    updatedAt,
  });

  const updatedDoc = await docRef.get();
  const data = updatedDoc.data() as Table;
  return {
    ...data,
    id: data.id || updatedDoc.id,
  };
}

export async function deleteTable(tableId: string): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection("tables").doc(tableId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Table not found");
  }
  await docRef.delete();
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

// ===== RESTAURANT SETTINGS =====

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  const db = getAdminDb();
  const doc = await db.collection("settings").doc("restaurant").get();
  if (doc.exists) {
    return { ...DEFAULT_SETTINGS, ...(doc.data() as RestaurantSettings) };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function updateRestaurantSettings(
  updates: Partial<RestaurantSettings>
): Promise<RestaurantSettings> {
  const db = getAdminDb();
  await db.collection("settings").doc("restaurant").set(updates, { merge: true });
  return await getRestaurantSettings();
}