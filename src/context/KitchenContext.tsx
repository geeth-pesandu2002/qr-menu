"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, OrderStatus } from "../lib/types";

export interface KitchenOrder extends Order {
  elapsedMinutes?: number;
}

interface KitchenContextType {
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  kitchenOrders: KitchenOrder[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  getOrdersByStatus: (statusGroup: "NEW" | "PREPARING" | "READY" | "SERVED") => KitchenOrder[];
  activeOrder: KitchenOrder | null;
  setActiveOrder: (order: KitchenOrder | null) => void;
}

// Initial mock orders matching the Kitchen Staff UI screenshot (Tables 05, 03, 02, 07, 08, 06)
const DEFAULT_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: "1001",
    tableId: "05",
    tableLabel: "Table 05",
    sessionId: "s1001",
    status: "RECEIVED",
    lines: [
      { itemId: "b1", name: "1 x Chicken Burger", variantLabel: null, unitPrice: 1200, qty: 1, note: "No onions, extra cheese", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80" },
      { itemId: "d1", name: "1 x Coke", variantLabel: null, unitPrice: 300, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80" },
      { itemId: "f1", name: "1 x Fries", variantLabel: null, unitPrice: 500, qty: 1, note: "Extra crispy", imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 2000,
    serviceCharge: 100,
    total: 2000,
    createdAt: Date.now() - 1000 * 60 * 2, // 2 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 2,
  },
  {
    id: "0002",
    tableId: "07",
    tableLabel: "Table 07",
    sessionId: "s0002",
    status: "RECEIVED",
    lines: [
      { itemId: "p1", name: "1 x Margherita Pizza", variantLabel: null, unitPrice: 1500, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&auto=format&fit=crop&q=80" },
      { itemId: "d1", name: "2 x Iced Coffee", variantLabel: null, unitPrice: 600, qty: 2, note: "", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 2700,
    serviceCharge: 135,
    total: 2700,
    createdAt: Date.now() - 1000 * 60 * 4, // 4 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 4,
  },
  {
    id: "0099",
    tableId: "03",
    tableLabel: "Table 03",
    sessionId: "s0099",
    status: "PREPARING",
    lines: [
      { itemId: "b2", name: "1 x Beef Burger", variantLabel: null, unitPrice: 1350, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=80" },
      { itemId: "o1", name: "1 x Onion Rings", variantLabel: null, unitPrice: 450, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 1800,
    serviceCharge: 90,
    total: 1800,
    createdAt: Date.now() - 1000 * 60 * 6, // 6 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 6,
  },
  {
    id: "0098",
    tableId: "08",
    tableLabel: "Table 08",
    sessionId: "s0098",
    status: "PREPARING",
    lines: [
      { itemId: "pa1", name: "1 x Chicken Pasta", variantLabel: null, unitPrice: 1400, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&auto=format&fit=crop&q=80" },
      { itemId: "g1", name: "1 x Garlic Bread", variantLabel: null, unitPrice: 400, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 1800,
    serviceCharge: 90,
    total: 1800,
    createdAt: Date.now() - 1000 * 60 * 10, // 10 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 10,
  },
  {
    id: "0097",
    tableId: "02",
    tableLabel: "Table 02",
    sessionId: "s0097",
    status: "SERVED", // Treated as Ready in Kanban View
    lines: [
      { itemId: "cs1", name: "1 x Caesar Salad", variantLabel: null, unitPrice: 1100, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80" },
      { itemId: "l1", name: "1 x Lemonade", variantLabel: null, unitPrice: 650, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 1750,
    serviceCharge: 87,
    total: 1750,
    createdAt: Date.now() - 1000 * 60 * 12, // 12 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 12,
  },
  {
    id: "0096",
    tableId: "06",
    tableLabel: "Table 06",
    sessionId: "s0096",
    status: "SERVED",
    lines: [
      { itemId: "p2", name: "1 x Pepperoni Pizza", variantLabel: null, unitPrice: 1750, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&auto=format&fit=crop&q=80" },
      { itemId: "d1", name: "1 x Coke", variantLabel: null, unitPrice: 300, qty: 1, note: "", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80" },
    ],
    subtotal: 2050,
    serviceCharge: 100,
    total: 2050,
    createdAt: Date.now() - 1000 * 60 * 15, // 15 mins ago
    updatedAt: Date.now(),
    elapsedMinutes: 15,
  },
];

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dinego_kitchen_auth") === "true";
  });

  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(() => {
    if (typeof window === "undefined") return DEFAULT_KITCHEN_ORDERS;
    try {
      const saved = localStorage.getItem("dinego_kitchen_orders");
      return saved ? JSON.parse(saved) : DEFAULT_KITCHEN_ORDERS;
    } catch {
      return DEFAULT_KITCHEN_ORDERS;
    }
  });

  const [activeOrder, setActiveOrder] = useState<KitchenOrder | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("dinego_kitchen_orders", JSON.stringify(kitchenOrders));
    } catch {}
  }, [kitchenOrders]);

  const login = (email: string) => {
    if (email.trim().length > 0) {
      setIsAuthenticated(true);
      localStorage.setItem("dinego_kitchen_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dinego_kitchen_auth");
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setKitchenOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: Date.now() } : o))
    );

    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getOrdersByStatus = (statusGroup: "NEW" | "PREPARING" | "READY" | "SERVED") => {
    switch (statusGroup) {
      case "NEW":
        return kitchenOrders.filter((o) => o.status === "RECEIVED");
      case "PREPARING":
        return kitchenOrders.filter((o) => o.status === "PREPARING");
      case "READY":
        return kitchenOrders.filter((o) => o.status === "SERVED");
      case "SERVED":
        return kitchenOrders.filter((o) => o.status === "COMPLETED");
      default:
        return kitchenOrders;
    }
  };

  return (
    <KitchenContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        kitchenOrders,
        updateOrderStatus,
        getOrdersByStatus,
        activeOrder,
        setActiveOrder,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error("useKitchen must be used within a KitchenProvider");
  }
  return context;
};
