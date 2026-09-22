// src/lib/types.ts
// Complete type definitions for DineGo app with full admin features

export type OrderStatus = "RECEIVED" | "PREPARING" | "SERVED" | "COMPLETED";
export type UserRole = "customer" | "kitchen" | "owner";

// Category
export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// Menu Item Variant
export interface Variant {
  label: string;   // "Small", "Large"
  price: number;   // cents: 450.00 = 45000
}

// Menu Item
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;        // cents
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  variants: Variant[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// Table with QR Token
export interface Table {
  id: string;
  label: string;
  qrToken: string;
  qrUrl: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// Order Line Item
export interface OrderLine {
  itemId: string;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  qty: number;
  note: string;
  lineTotal: number;
}

// Order Status History
export interface StatusHistory {
  status: OrderStatus;
  changedAt: number;
  changedBy: string;
}

// Order
export interface Order {
  id: string;
  tableId: string;
  tableLabel: string;
  qrToken: string;
  sessionId: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  statusHistory: StatusHistory[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// User Claims
export interface UserClaims {
  role: UserRole;
  restaurantId?: string;
  uid: string;
  email?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Analytics Query
export interface AnalyticsQuery {
  startDate: number;
  endDate: number;
  restaurantId?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  dateRange: {
    start: number;
    end: number;
  };
}

// Top Items
export interface TopItem {
  itemId: string;
  name: string;
  qty: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

// QR Code
export interface QRCodeData {
  tableId: string;
  tableLabel: string;
  qrToken: string;
  qrUrl: string;
  dataUrl: string;
}

// Helpers
export const formatPrice = (cents: number): string =>
  `Rs. ${(cents / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export const centsToRupees = (cents: number): number => cents / 100;
export const rupeesToCents = (rupees: number): number => Math.round(rupees * 100);

// State Machine
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "RECEIVED": ["PREPARING"],
  "PREPARING": ["SERVED"],
  "SERVED": ["COMPLETED"],
  "COMPLETED": [],
};

export const isValidStatusTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};