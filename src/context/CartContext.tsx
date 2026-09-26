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
  placeOrder: () => Order;
  getOrderById: (orderId: string) => Order | undefined;
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
    localStorage.setItem("dinego_table", JSON.stringify({ id, label: tableLbl }));
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

  const placeOrder = (): Order => {
    const orderId = (1020 + orders.length + 1).toString();
    const newOrder: Order = {
      id: orderId,
      tableId,
      tableLabel,
      sessionId: `session_${Date.now()}`,
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
      })),
      subtotal,
      serviceCharge,
      total,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedMinutes: 15,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Also sync order to kitchen orders for live kitchen board integration
    try {
      const savedKitchenOrders = localStorage.getItem("dinego_kitchen_orders");
      const kitchenList = savedKitchenOrders ? JSON.parse(savedKitchenOrders) : [];
      localStorage.setItem(
        "dinego_kitchen_orders",
        JSON.stringify([{ ...newOrder, elapsedMinutes: 1 }, ...kitchenList])
      );
    } catch {}

    clearCart();
    return newOrder;
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
