"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order, OrderStatus, formatPrice } from "@/src/lib/types";
import OrderCard from "@/src/components/admin/orders/OrderCard";
import { getAuthHeaders } from "@/src/lib/auth-client";

// Initial orders strictly adhering to existing domain Order and OrderStatus types
const INITIAL_MOCK_ORDERS: Order[] = [];

type FilterTab = "ALL" | OrderStatus;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "RECEIVED", label: "Received" },
  { id: "PREPARING", label: "Preparing" },
  { id: "SERVED", label: "Served" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live order polling from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setOrders(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live orders for admin:", err);
      }
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Status transition handler with live backend sync
  const handleStatusTransition = async (orderId: string, nextStatus: OrderStatus) => {
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

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(`Failed to update order status: ${json.error || res.statusText}`);
      }
    } catch (err) {
      console.warn("Failed to persist order status transition:", err);
    }
  };

  // Compute live counts
  const activeOrdersCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
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
            onClick={() => setOrders(INITIAL_MOCK_ORDERS)}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B2C]/10 hover:bg-[#FF6B2C]/20 text-[#FF6B2C] text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Reset mock orders"
          >
            <span>🔄</span>
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

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

        {/* Average Preparation Time */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Avg. Prep Time
            </p>
            <p className="text-3xl font-black text-[#121212]">
              14 mins
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">
              ↓ 2m faster than target
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#198754] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            ⚡
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
