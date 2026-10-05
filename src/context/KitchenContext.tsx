"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Order, OrderStatus } from "../lib/types";
import { auth } from "@/src/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export interface KitchenOrder extends Order {
  elapsedMinutes?: number;
}

interface KitchenContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  authType: "firebase" | "demo" | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => boolean;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  kitchenOrders: KitchenOrder[];
  isLoadingOrders: boolean;
  ordersError: string | null;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  getOrdersByStatus: (statusGroup: "NEW" | "PREPARING" | "READY" | "SERVED") => KitchenOrder[];
  activeOrder: KitchenOrder | null;
  setActiveOrder: (order: KitchenOrder | null) => void;
  addKitchenOrder: (order: Order) => void;
  refreshKitchenOrders: () => Promise<void>;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [authType, setAuthType] = useState<"firebase" | "demo" | null>(null);

  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<KitchenOrder | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Firebase Auth State Listener & Demo State Initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role;

          if (role === "kitchen") {
            if (isMountedRef.current) {
              setUser(firebaseUser);
              setAuthType("firebase");
              setIsAuthenticated(true);
              setIsAuthLoading(false);
            }
            return;
          } else {
            console.warn("User does not have kitchen role:", role);
            await signOut(auth);
            if (isMountedRef.current) {
              setUser(null);
              setAuthType(null);
              setIsAuthenticated(false);
              setIsAuthLoading(false);
            }
            return;
          }
        } catch (err) {
          console.error("Error reading Firebase ID token claims:", err);
          if (isMountedRef.current) {
            setUser(null);
            setAuthType(null);
            setIsAuthenticated(false);
            setIsAuthLoading(false);
          }
          return;
        }
      }

      // If no Firebase user, check if a demo session exists
      try {
        const demoToken = localStorage.getItem("dinego_demo_staff_token");
        if (demoToken === "staff-token") {
          if (isMountedRef.current) {
            setUser(null);
            setAuthType("demo");
            setIsAuthenticated(true);
            setIsAuthLoading(false);
          }
          return;
        }
      } catch {}

      if (isMountedRef.current) {
        setUser(null);
        setAuthType(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Helper to get an authenticated Bearer token (fresh Firebase token or staff-token)
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (authType === "demo") {
      return "staff-token";
    }

    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(false);
        return token;
      } catch (err) {
        console.warn("Could not retrieve fresh Firebase ID token:", err);
      }
    }

    try {
      const demoToken = localStorage.getItem("dinego_demo_staff_token");
      if (demoToken === "staff-token") {
        return "staff-token";
      }
    } catch {}

    return null;
  }, [authType]);

  // 3. Login with Firebase Client Auth
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsAuthLoading(true);
      // Clear demo token
      try {
        localStorage.removeItem("dinego_demo_staff_token");
      } catch {}

      if (!password) {
        return { success: false, error: "Password is required." };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idTokenResult = await userCredential.user.getIdTokenResult(true);

      if (idTokenResult.claims.role !== "kitchen") {
        await signOut(auth);
        setUser(null);
        setAuthType(null);
        setIsAuthenticated(false);
        return {
          success: false,
          error: "Access denied. This account does not have kitchen privileges.",
        };
      }

      setUser(userCredential.user);
      setAuthType("firebase");
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      let message = "Invalid email or password. Please try again.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      } else if (err instanceof Error) {
        message = err.message;
      }
      return { success: false, error: message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 4. Demo Login for Testing (explicit staff-token supported by backend)
  const loginDemo = (): boolean => {
    try {
      localStorage.setItem("dinego_demo_staff_token", "staff-token");
    } catch {}
    setUser(null);
    setAuthType("demo");
    setIsAuthenticated(true);
    return true;
  };

  // 5. Logout
  const logout = async () => {
    try {
      localStorage.removeItem("dinego_demo_staff_token");
      localStorage.removeItem("dinego_kitchen_orders");
    } catch {}

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Firebase sign out error:", err);
    }

    setUser(null);
    setAuthType(null);
    setIsAuthenticated(false);
    setKitchenOrders([]);
  };

  // 6. Fetch orders from deployed backend
  const fetchKitchenOrders = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      setIsLoadingOrders(true);
      setOrdersError(null);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";
      const res = await fetch(`${apiBase}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Order fetch failed with HTTP status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error(json.error || "Invalid response received from orders API");
      }

      if (isMountedRef.current) {
        const mapped: KitchenOrder[] = json.data.map((o: Order) => ({
          ...o,
          elapsedMinutes: Math.max(
            1,
            Math.round((Date.now() - (o.createdAt || Date.now())) / 60000)
          ),
        }));
        setKitchenOrders(mapped);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load live kitchen orders";
      console.error("🔴 Kitchen order fetch failed:", err);
      if (isMountedRef.current) {
        setOrdersError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingOrders(false);
      }
    }
  }, [getAuthToken]);

  // 7. Polling scoped ONLY to authenticated kitchen routes (stops global polling leak!)
  useEffect(() => {
    const isKitchenRoute = pathname ? pathname.startsWith("/kitchen") && pathname !== "/kitchen/login" : false;

    // Do NOT poll if user is on diner pages, landing, admin, or not authenticated
    if (!isKitchenRoute || !isAuthenticated) {
      return;
    }

    // Initial fetch on entering kitchen route
    fetchKitchenOrders();

    // Poll every 5 seconds while on kitchen route
    const interval = setInterval(() => {
      fetchKitchenOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [pathname, isAuthenticated, fetchKitchenOrders]);

  // 8. Manual Refresh
  const refreshKitchenOrders = async () => {
    await fetchKitchenOrders();
  };

  // 9. Status Update via PATCH /backend-api/orders/[id]
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<boolean> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication token required to update status.");
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";
    const res = await fetch(`${apiBase}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const msg = errorJson?.error || `Failed to update order status (${res.status})`;
      throw new Error(msg);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json?.error || "Invalid response from server");
    }

    const updatedOrder = json.data as Order;

    // Update real state after backend confirmation
    setKitchenOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ...updatedOrder,
              elapsedMinutes: o.elapsedMinutes,
            }
          : o
      )
    );

    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, ...updatedOrder } : null));
    }

    return true;
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

  // Helper for customer-side placement (kept for compatibility)
  const addKitchenOrder = (newOrder: Order) => {
    const kitchenItem: KitchenOrder = {
      ...newOrder,
      elapsedMinutes: 1,
    };
    setKitchenOrders((prev) => [kitchenItem, ...prev.filter((o) => o.id !== newOrder.id)]);
  };

  return (
    <KitchenContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        user,
        authType,
        login,
        loginDemo,
        logout,
        getAuthToken,
        kitchenOrders,
        isLoadingOrders,
        ordersError,
        updateOrderStatus,
        getOrdersByStatus,
        activeOrder,
        setActiveOrder,
        addKitchenOrder,
        refreshKitchenOrders,
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
