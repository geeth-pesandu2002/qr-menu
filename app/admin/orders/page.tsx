"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, formatPrice } from "@/src/lib/types";
import OrderCard from "@/src/components/admin/orders/OrderCard";

// Initial mock orders strictly adhering to existing domain Order and OrderStatus types
const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: "1048",
    tableId: "05",
    tableLabel: "Table 05",
    sessionId: "sess_1048",
    status: "RECEIVED",
    lines: [
      { itemId: "k1", name: "Chicken Kottu", variantLabel: "Large", unitPrice: 1100, qty: 2, note: "Extra spicy" },
      { itemId: "d1", name: "Coke Can", variantLabel: null, unitPrice: 300, qty: 2, note: "" },
    ],
    subtotal: 2800,
    serviceCharge: 140,
    tax: 280,
    total: 3220,
    createdAt: Date.now() - 1000 * 60 * 3, // 3 mins ago
    updatedAt: Date.now() - 1000 * 60 * 3,
  },
  {
    id: "1049",
    tableId: "04",
    tableLabel: "Table 04",
    sessionId: "sess_1049",
    status: "RECEIVED",
    lines: [
      { itemId: "k2", name: "Cheese Kottu", variantLabel: null, unitPrice: 1100, qty: 1, note: "Extra melted cheese" },
      { itemId: "t1", name: "Plain Tea", variantLabel: "Regular", unitPrice: 100, qty: 2, note: "" },
    ],
    subtotal: 1300,
    serviceCharge: 65,
    tax: 130,
    total: 1495,
    createdAt: Date.now() - 1000 * 60 * 6, // 6 mins ago
    updatedAt: Date.now() - 1000 * 60 * 6,
  },
  {
    id: "1047",
    tableId: "02",
    tableLabel: "Table 02",
    sessionId: "sess_1047",
    status: "PREPARING",
    lines: [
      { itemId: "p1", name: "Margherita Pizza", variantLabel: null, unitPrice: 1500, qty: 1, note: "Crispy crust" },
      { itemId: "f1", name: "French Fries", variantLabel: null, unitPrice: 500, qty: 1, note: "Extra ketchup" },
    ],
    subtotal: 2000,
    serviceCharge: 100,
    tax: 200,
    total: 2300,
    createdAt: Date.now() - 1000 * 60 * 12, // 12 mins ago
    updatedAt: Date.now() - 1000 * 60 * 6,
  },
  {
    id: "1046",
    tableId: "08",
    tableLabel: "Table 08",
    sessionId: "sess_1046",
    status: "PREPARING",
    lines: [
      { itemId: "b2", name: "Beef Burger Deluxe", variantLabel: null, unitPrice: 1350, qty: 2, note: "No pickles" },
      { itemId: "d2", name: "Iced Coffee", variantLabel: "Regular", unitPrice: 600, qty: 2, note: "" },
    ],
    subtotal: 3900,
    serviceCharge: 195,
    tax: 390,
    total: 4485,
    createdAt: Date.now() - 1000 * 60 * 18, // 18 mins ago
    updatedAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: "1045",
    tableId: "03",
    tableLabel: "Table 03",
    sessionId: "sess_1045",
    status: "SERVED",
    lines: [
      { itemId: "pa1", name: "Creamy Chicken Pasta", variantLabel: null, unitPrice: 1400, qty: 1, note: "" },
      { itemId: "g1", name: "Garlic Bread", variantLabel: null, unitPrice: 400, qty: 1, note: "" },
    ],
    subtotal: 1800,
    serviceCharge: 90,
    tax: 180,
    total: 2070,
    createdAt: Date.now() - 1000 * 60 * 25, // 25 mins ago
    updatedAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: "1044",
    tableId: "07",
    tableLabel: "Table 07",
    sessionId: "sess_1044",
    status: "SERVED",
    lines: [
      { itemId: "cs1", name: "Caesar Salad", variantLabel: null, unitPrice: 1100, qty: 2, note: "Dressing on the side" },
      { itemId: "l1", name: "Fresh Lemonade", variantLabel: null, unitPrice: 650, qty: 2, note: "Less sugar" },
    ],
    subtotal: 3500,
    serviceCharge: 175,
    tax: 350,
    total: 4025,
    createdAt: Date.now() - 1000 * 60 * 35, // 35 mins ago
    updatedAt: Date.now() - 1000 * 60 * 16,
  },
  {
    id: "1043",
    tableId: "01",
    tableLabel: "Table 01",
    sessionId: "sess_1043",
    status: "COMPLETED",
    lines: [
      { itemId: "fr1", name: "Mixed Fried Rice", variantLabel: null, unitPrice: 750, qty: 2, note: "" },
      { itemId: "mc1", name: "Hot Milk Coffee", variantLabel: "Large", unitPrice: 200, qty: 2, note: "" },
    ],
    subtotal: 1900,
    serviceCharge: 95,
    tax: 190,
    total: 2185,
    createdAt: Date.now() - 1000 * 60 * 55, // 55 mins ago
    updatedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "1042",
    tableId: "06",
    tableLabel: "Table 06",
    sessionId: "sess_1042",
    status: "CANCELLED",
    lines: [
      { itemId: "fb1", name: "Spicy Fish Bun", variantLabel: null, unitPrice: 120, qty: 2, note: "" },
    ],
    subtotal: 240,
    serviceCharge: 12,
    tax: 24,
    total: 276,
    createdAt: Date.now() - 1000 * 60 * 68, // 68 mins ago
    updatedAt: Date.now() - 1000 * 60 * 65,
  },
];

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

  // Status transition handler for mock UI state
  const handleStatusTransition = (orderId: string, nextStatus: OrderStatus) => {
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
