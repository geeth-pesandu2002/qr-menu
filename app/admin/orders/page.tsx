"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order, OrderStatus, formatPrice } from "@/src/lib/types";
import OrderCard from "@/src/components/admin/orders/OrderCard";
import { adminFetch } from "@/src/lib/admin-api";

type FilterTab = "ALL" | OrderStatus;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "RECEIVED", label: "Received" },
  { id: "PREPARING", label: "Preparing" },
  { id: "SERVED", label: "Served" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live order polling from backend
  const fetchOrders = async () => {
    try {
      const json = await adminFetch("/backend-api/orders");
      if (json?.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
      setError(null);
    } catch (err: any) {
      console.error("Could not fetch live orders for admin:", err);
      setError(err?.message || "Failed to fetch live orders from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Status transition handler with confirmed backend sync (no premature UI update)
  const handleStatusTransition = async (orderId: string, nextStatus: OrderStatus) => {
    setActionError(null);
    try {
      await adminFetch(`/backend-api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      // Confirmed success: update local state
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: nextStatus,
              updatedAt: Date.now(),
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  status: nextStatus,
                  changedAt: Date.now(),
                  changedBy: "owner",
                },
              ],
            };
          }
          return order;
        })
      );
    } catch (err: any) {
      console.error("Failed to persist order status transition:", err);
      setActionError(err?.message || "Failed to update order status on server. Please try again.");
    }
  };

  // Compute live counts
  const activeOrdersCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const completedOrdersCount = orders.filter(
    (o) => o.status === "COMPLETED"
  ).length;

  const servedOrdersCount = orders.filter(
    (o) => o.status === "SERVED"
  ).length;

  const servedOrdersValue = orders
    .filter((o) => o.status === "SERVED")
    .reduce((sum, o) => sum + o.total, 0);

  // Filter orders by active tab and search query
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.lines.some((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">
              Live Orders Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Monitor real-time kitchen operations, track customer tickets, and update order statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Refresh live orders"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banners */}
      {(error || actionError) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{actionError || error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setActionError(null);
            }}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Orders in Kitchen */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Active Orders
            </p>
            <p className="text-3xl font-black text-[#121212]">
              {activeOrdersCount}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold">
              In kitchen & preparation
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F4B400] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            🍳
          </div>
        </div>

        {/* Completed Orders Summary */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Completed Orders
            </p>
            <p className="text-3xl font-black text-[#121212]">
              {completedOrdersCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">
              Billed & fulfilled tickets
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#198754] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            ✓
          </div>
        </div>

        {/* Served Orders Summary */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Served Orders
            </p>
            <p className="text-3xl font-black text-[#121212]">
              {servedOrdersCount}
            </p>
            <p className="text-[11px] text-zinc-500 font-semibold">
              {formatPrice(servedOrdersValue)} served order value
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            🍽️
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              const count =
                tab.id === "ALL"
                  ? orders.length
                  : orders.filter((o) => o.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? "bg-[#121212] text-white shadow-sm"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table, order, or item..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center text-3xl">
            📦
          </div>
          <h3 className="font-extrabold text-base text-[#121212]">
            No Orders Found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try a different keyword.`
              : `There are currently no orders in status "${activeTab}".`}
          </p>
          {(activeTab !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusTransition={handleStatusTransition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
