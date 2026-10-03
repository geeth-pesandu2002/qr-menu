"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, Variant, Order } from "../lib/types";
import { createOrder } from "../lib/api-client";

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
  qrToken: string | null;
  isTableActive: boolean;
  setTable: (
    id: string,
    label?: string,
    qrToken?: string | null,
    isActive?: boolean
  ) => void;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Retrieves an existing stable session ID from localStorage or creates a single persistent one.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "session_guest";
  try {
    let sid = localStorage.getItem("dinego_session_id");
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("dinego_session_id", sid);
    }
    return sid;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableId, setTableId] = useState<string>(() => {
    if (typeof window === "undefined") return "05";
    try {
      const saved = localStorage.getItem("dinego_table");
      return saved ? JSON.parse(saved).id || "05" : "05";
    } catch {
      return "05";
    }
  });

  const [tableLabel, setTableLabel] = useState<string>(() => {
    if (typeof window === "undefined") return "Table 05";
    try {
      const saved = localStorage.getItem("dinego_table");
      return saved ? JSON.parse(saved).label || "Table 05" : "Table 05";
    } catch {
      return "Table 05";
    }
  });

  const [qrToken, setQrToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("dinego_table");
      return saved ? JSON.parse(saved).qrToken || null : null;
    } catch {
      return null;
    }
  });

  const [isTableActive, setIsTableActive] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("dinego_table");
      return saved ? JSON.parse(saved).isActive ?? true : true;
    } catch {
      return true;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedCart = localStorage.getItem("dinego_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedOrders = localStorage.getItem("dinego_orders");
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dinego_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("dinego_orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const setTable = (
    id: string,
    label?: string,
    token?: string | null,
    isActive?: boolean
  ) => {
    const tableLbl = label || `Table ${id.padStart(2, "0")}`;
    const tokenVal = token ?? null;
    const activeVal = isActive !== undefined ? isActive : true;

    setTableId(id);
    setTableLabel(tableLbl);
    setQrToken(tokenVal);
    setIsTableActive(activeVal);

    try {
      localStorage.setItem(
        "dinego_table",
        JSON.stringify({
          id,
          label: tableLbl,
          qrToken: tokenVal,
          isActive: activeVal,
        })
      );
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

  const placeOrder = async (): Promise<Order> => {
    if (!qrToken) {
      throw new Error(
        "Table QR code token not verified. Please scan the QR code at your table again."
      );
    }
    if (!isTableActive) {
      throw new Error("This table is currently inactive and cannot accept orders.");
    }
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Please add items before placing an order.");
    }

    const sessionId = getOrCreateSessionId();

    const createdOrder = await createOrder({
      qrToken,
      sessionId,
      items: cart.map((ci) => ({
        itemId: ci.item.id,
        qty: ci.quantity,
        variantLabel: ci.selectedVariant ? ci.selectedVariant.label : undefined,
        note: ci.note ? ci.note.trim() : undefined,
      })),
      serviceChargePercent: 5,
      taxPercent: 10,
    });

    // Update local orders list with the real backend order
    setOrders((prev) => [createdOrder, ...prev]);
    // Clear cart only after successful backend creation
    clearCart();
    return createdOrder;
  };

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);

  return (
    <CartContext.Provider
      value={{
        tableId,
        tableLabel,
        qrToken,
        isTableActive,
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

