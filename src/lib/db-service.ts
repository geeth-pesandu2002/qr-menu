// src/lib/db-service.ts
// Database access layer - reusable functions for all API endpoints

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

  const orderRef = getAdminDb().collection("orders").doc();

  const order: Order = {
    id: orderRef.id,
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

  await orderRef.set(order);
  return order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const doc = await getAdminDb().collection("orders").doc(orderId).get();
  return (doc.data() as Order) || null;
}

export async function getOrdersByTableAndStatus(
  tableId: string,
  status?: OrderStatus
): Promise<Order[]> {
  let query: FirebaseFirestore.Query = getAdminDb()
    .collection("orders")
    .where("tableId", "==", tableId);

  if (status) {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as Order);
}

export async function getOrdersByDateRange(
  startDate: number,
  endDate: number
): Promise<Order[]> {
  const snapshot = await getAdminDb()
    .collection("orders")
    .where("createdAt", ">=", startDate)
    .where("createdAt", "<=", endDate)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Order);
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  changedBy: string
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  // Validate status transition
  if (!isValidStatusTransition(order.status, newStatus)) {
    throw new Error(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  const statusHistory: StatusHistory = {
    status: newStatus,
    changedAt: Date.now(),
    changedBy,
  };

  await getAdminDb().collection("orders").doc(orderId).update({
    status: newStatus,
    statusHistory: [...(order.statusHistory || []), statusHistory],
    updatedAt: Date.now(),
  });

  return getOrderById(orderId) as Promise<Order>;
}

// ===== MENU ITEMS =====

export async function getMenuItems(): Promise<MenuItem[]> {
  const snapshot = await getAdminDb()
    .collection("menuItems")
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as MenuItem);
}

export async function getMenuItemById(itemId: string): Promise<MenuItem | null> {
  const doc = await getAdminDb().collection("menuItems").doc(itemId).get();
  return (doc.data() as MenuItem) || null;
}

export async function createMenuItem(
  item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<MenuItem> {
  const itemRef = getAdminDb().collection("menuItems").doc();

  const newItem: MenuItem = {
    ...item,
    id: itemRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await itemRef.set(newItem);
  return newItem;
}

export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<MenuItem> {
  await getAdminDb()
    .collection("menuItems")
    .doc(itemId)
    .update({
      ...updates,
      updatedAt: Date.now(),
    });

  return getMenuItemById(itemId) as Promise<MenuItem>;
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await getAdminDb().collection("menuItems").doc(itemId).delete();
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getAdminDb()
    .collection("categories")
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Category);
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const doc = await getAdminDb().collection("categories").doc(categoryId).get();
  return (doc.data() as Category) || null;
}

export async function createCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Category> {
  const catRef = getAdminDb().collection("categories").doc();

  const newCategory: Category = {
    ...category,
    id: catRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await catRef.set(newCategory);
  return newCategory;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Category>
): Promise<Category> {
  await getAdminDb()
    .collection("categories")
    .doc(categoryId)
    .update({
      ...updates,
      updatedAt: Date.now(),
    });

  return getCategoryById(categoryId) as Promise<Category>;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await getAdminDb().collection("categories").doc(categoryId).delete();
}

// ===== TABLES =====

export async function getTables(): Promise<Table[]> {
  const snapshot = await getAdminDb()
    .collection("tables")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Table);
}

export async function getTableByQRToken(qrToken: string): Promise<Table | null> {
  const snapshot = await getAdminDb()
    .collection("tables")
    .where("qrToken", "==", qrToken)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Table;
}

export async function getTableById(tableId: string): Promise<Table | null> {
  const doc = await getAdminDb().collection("tables").doc(tableId).get();
  return (doc.data() as Table) || null;
}

export async function createTable(
  table: Omit<Table, "id" | "createdAt" | "updatedAt">,
  createdBy: string
): Promise<Table> {
  const tableRef = getAdminDb().collection("tables").doc();

  const newTable: Table = {
    ...table,
    id: tableRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  };

  await tableRef.set(newTable);
  return newTable;
}

export async function updateTable(
  tableId: string,
  updates: Partial<Table>
): Promise<Table> {
  await getAdminDb()
    .collection("tables")
    .doc(tableId)
    .update({
      ...updates,
      updatedAt: Date.now(),
    });

  return getTableById(tableId) as Promise<Table>;
}

export async function deleteTable(tableId: string): Promise<void> {
  await getAdminDb().collection("tables").doc(tableId).delete();
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
      trend: "stable" as const, // TODO: compare with previous period
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