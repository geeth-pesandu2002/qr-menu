"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, Variant, Order } from "../lib/types";

export interface CartItem {
  id: string; // unique cart item id (itemId + variantLabel)
  item: MenuItem;
  selectedVariant?: Variant;
  quantity: number;
  note: string;
}

interface CartContextType {
  tableId: string;
  tableLabel: string;
  setTable: (id: string, label?: string) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, variant?: Variant, note?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  serviceCharge: number;
  total: number;
  itemCount: number;
  orders: Order[];
  placeOrder: () => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableId, setTableId] = useState<string>("05");
  const [tableLabel, setTableLabel] = useState<string>("Table 05");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage after initial client mount to prevent SSR hydration mismatches
  useEffect(() => {
    try {
      const savedTable = localStorage.getItem("dinego_table");
      if (savedTable) {
        const parsed = JSON.parse(savedTable);
        if (parsed.id) setTableId(parsed.id);
        if (parsed.label) setTableLabel(parsed.label);
      }
      const savedCart = localStorage.getItem("dinego_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem("dinego_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage only after initial load
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("dinego_cart", JSON.stringify(cart));
    } catch {}
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("dinego_orders", JSON.stringify(orders));
    } catch {}
  }, [orders, isLoaded]);

  const setTable = (id: string, label?: string) => {
    const tableLbl = label || `Table ${id.padStart(2, "0")}`;
    setTableId(id);
    setTableLabel(tableLbl);
    try {
      localStorage.setItem("dinego_table", JSON.stringify({ id, label: tableLbl }));
    } catch {}
  };

  const addToCart = (item: MenuItem, quantity: number, variant?: Variant, note: string = "") => {
    const cartItemId = `${item.id}-${variant ? variant.label : "default"}`;

    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === cartItemId);
      if (existing) {
        return prev.map((ci) =>
          ci.id === cartItemId
            ? { ...ci, quantity: ci.quantity + quantity, note: note || ci.note }
            : ci
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          item,
          selectedVariant: variant,
          quantity,
          note,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.id === cartItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, ci) => {
    const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
    return acc + unitPrice * ci.quantity;
  }, 0);

  const serviceCharge = Math.round(subtotal * 0.05); // 5% service charge
  const total = subtotal + serviceCharge;
  const itemCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);

  const refreshOrders = async () => {
    try {
      const sessionId = localStorage.getItem("dinego_session_id");
      const url = sessionId
        ? `/api/orders?sessionId=${encodeURIComponent(sessionId)}`
        : `/api/orders?tableId=${encodeURIComponent(tableId)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setOrders((prev) => {
            const combined = [...json.data];
            for (const o of prev) {
              if (!combined.some((c) => c.id === o.id)) {
                combined.push(o);
              }
            }
            return combined;
          });
        }
      }
    } catch (e) {
      console.warn("Could not refresh orders from API:", e);
    }
  };

  const placeOrder = async (): Promise<Order> => {
    let sessionId = "";
    try {
      sessionId = localStorage.getItem("dinego_session_id") || "";
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem("dinego_session_id", sessionId);
      }
    } catch {
      sessionId = `sess_${Date.now()}`;
    }

    const payload = {
      tableId,
      sessionId,
      serviceChargePercent: 5,
      taxPercent: 10,
      items: cart.map((ci) => ({
        itemId: ci.item.id,
        name: ci.item.name,
        variantLabel: ci.selectedVariant ? ci.selectedVariant.label : null,
        unitPrice: ci.selectedVariant ? ci.selectedVariant.price : ci.item.price,
        qty: ci.quantity,
        note: ci.note || "",
        imageUrl: ci.item.imageUrl || null,
      })),
    };

    let createdOrder: Order;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          createdOrder = json.data;
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error(`Order API responded with status ${res.status}`);
      }
    } catch (err) {
      console.warn("API POST /api/orders failed, using client order backup:", err);
      createdOrder = {
        id: (1020 + orders.length + 1).toString(),
        tableId,
        tableLabel,
        sessionId,
        status: "RECEIVED",
        lines: cart.map((ci) => ({
          id: ci.id,
          itemId: ci.item.id,
          name: ci.item.name,
          variantLabel: ci.selectedVariant ? ci.selectedVariant.label : null,
          unitPrice: ci.selectedVariant ? ci.selectedVariant.price : ci.item.price,
          qty: ci.quantity,
          note: ci.note,
          imageUrl: ci.item.imageUrl,
          lineTotal: (ci.selectedVariant ? ci.selectedVariant.price : ci.item.price) * ci.quantity,
        })),
        subtotal,
        serviceCharge,
        tax: Math.round(subtotal * 0.1),
        total,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        estimatedMinutes: 15,
      };
    }

    setOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);

    try {
      const savedKitchenOrders = localStorage.getItem("dinego_kitchen_orders");
      const kitchenList = savedKitchenOrders ? JSON.parse(savedKitchenOrders) : [];
      localStorage.setItem(
        "dinego_kitchen_orders",
        JSON.stringify([{ ...createdOrder, elapsedMinutes: 1 }, ...kitchenList.filter((k: any) => k.id !== createdOrder.id)])
      );
    } catch {}

    clearCart();
    return createdOrder;
  };

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);

  return (
    <CartContext.Provider
      value={{
        tableId,
        tableLabel,
        setTable,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        serviceCharge,
        total,
        itemCount,
        orders,
        placeOrder,
        getOrderById,
        refreshOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
