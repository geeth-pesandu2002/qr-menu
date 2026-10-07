export type OrderStatus = "RECEIVED" | "PREPARING" | "SERVED" | "COMPLETED" | "CANCELLED";
export type UserRole = "customer" | "kitchen" | "owner";

export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export interface Variant {
  label: string;   // "Regular" | "Large"
  price: number;   // price in Rs.
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;        // price in Rs. (e.g. 1200)
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  variants: Variant[];  // empty array = no variants
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export interface Table {
  id: string;
  label: string;
  seats?: number;
  qrToken?: string;
  qrUrl?: string;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export type RestaurantTable = Table;

export interface OrderLine {
  id?: string;
  itemId: string;
  name: string;          
  variantLabel: string | null;
  unitPrice: number;     
  qty: number;
  note: string;
  imageUrl?: string | null;
  lineTotal?: number;
}

export interface StatusHistory {
  status: OrderStatus;
  changedAt: number;
  changedBy: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableLabel: string;
  qrToken?: string;
  sessionId: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  tax?: number;
  total: number;
  statusHistory?: StatusHistory[];
  createdAt: number;     // Date.now()
  updatedAt: number;
  createdBy?: string;
  estimatedMinutes?: number;
}

export interface UserClaims {
  role: UserRole;
  restaurantId?: string;
  uid: string;
  email?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface TopItem {
  itemId: string;
  name: string;
  qty: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

export const formatPrice = (amount: number) => {
  return `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "RECEIVED": ["PREPARING", "CANCELLED"],
  "PREPARING": ["SERVED", "CANCELLED"],
  "SERVED": ["COMPLETED"],
  "COMPLETED": [],
  "CANCELLED": [],
};

export const isValidStatusTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};
