export type OrderStatus = "RECEIVED" | "PREPARING" | "SERVED" | "CANCELLED";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Variant {
  label: string;   // "Small" | "Large"
  price: number;   // cents
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;        // cents: Rs. 450.00 => 45000
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  variants: Variant[];  // empty array = no variants
}

export interface OrderLine {
  itemId: string;
  name: string;          // copied at order time
  variantLabel: string | null;
  unitPrice: number;     // copied at order time
  qty: number;
  note: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableLabel: string;
  sessionId: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  createdAt: number;     // Date.now()
  updatedAt: number;
}

// Always divide by 100 only at display time
export const formatPrice = (cents: number) =>
  `Rs. ${(cents / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;