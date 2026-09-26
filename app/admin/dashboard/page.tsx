"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DashboardStats,
  TopItem,
  Order,
  formatPrice,
} from "@/src/lib/types";
import StatCard from "@/src/components/admin/dashboard/StatCard";
import OrderStatusBadge from "@/src/components/admin/orders/OrderStatusBadge";

// Mock Dashboard Statistics matching DashboardStats interface
const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalOrders: 48,
  totalRevenue: 78650,
  averageOrderValue: 1638.54,
  completedOrders: 39,
  pendingOrders: 9,
  dateRange: {
    start: new Date().setHours(0, 0, 0, 0),
    end: Date.now(),
  },
};

// Mock Top Selling Items matching TopItem interface
const MOCK_TOP_ITEMS: TopItem[] = [
  {
    itemId: "kottu-chicken",
    name: "Chicken Kottu",
    qty: 34,
    revenue: 28900,
    trend: "up",
  },
  {
    itemId: "burger-cheese",
    name: "Cheese Burger Deluxe",
    qty: 26,
    revenue: 22100,
    trend: "up",
  },
  {
    itemId: "pizza-margherita",
    name: "Margherita Pizza",
    qty: 18,
    revenue: 16200,
    trend: "stable",
  },
  {
    itemId: "short-eats-fish-bun",
    name: "Spicy Fish Bun",
    qty: 42,
    revenue: 7560,
    trend: "up",
  },
  {
    itemId: "bev-iced-latte",
    name: "Caramel Iced Latte",
    qty: 15,
    revenue: 3890,
    trend: "down",
  },
];

// Mock Recent Orders strictly using allowed OrderStatus values
const MOCK_RECENT_ORDERS: Order[] = [
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
    id: "1047",
    tableId: "02",
    tableLabel: "Table 02",
    sessionId: "sess_1047",
    status: "PREPARING",
    lines: [
      { itemId: "p1", name: "Margherita Pizza", variantLabel: null, unitPrice: 1500, qty: 1, note: "Crispy crust" },
      { itemId: "f1", name: "French Fries", variantLabel: null, unitPrice: 500, qty: 1, note: "" },
    ],
    subtotal: 2000,
    serviceCharge: 100,
    tax: 200,
    total: 2300,
    createdAt: Date.now() - 1000 * 60 * 11, // 11 mins ago
    updatedAt: Date.now() - 1000 * 60 * 4,
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
    status: "COMPLETED",
    lines: [
      { itemId: "cs1", name: "Caesar Salad", variantLabel: null, unitPrice: 1100, qty: 2, note: "" },
      { itemId: "l1", name: "Fresh Lemonade", variantLabel: null, unitPrice: 650, qty: 2, note: "Less sugar" },
    ],
    subtotal: 3500,
    serviceCharge: 175,
    tax: 350,
    total: 4025,
    createdAt: Date.now() - 1000 * 60 * 48, // 48 mins ago
    updatedAt: Date.now() - 1000 * 60 * 15,
  },
];

// Hourly distribution for today's sales & orders chart
const HOURLY_SALES_DATA = [
  { hour: "9 AM", orders: 2, revenue: 3200, height: "15%" },
  { hour: "10 AM", orders: 3, revenue: 4800, height: "22%" },
  { hour: "11 AM", orders: 5, revenue: 8100, height: "38%" },
  { hour: "12 PM", orders: 8, revenue: 13500, height: "64%" },
  { hour: "1 PM", orders: 11, revenue: 18200, height: "86%" },
  { hour: "2 PM", orders: 7, revenue: 11400, height: "54%" },
  { hour: "3 PM", orders: 3, revenue: 4900, height: "23%" },
  { hour: "4 PM", orders: 4, revenue: 6200, height: "29%" },
  { hour: "5 PM", orders: 6, revenue: 9800, height: "46%" },
  { hour: "6 PM", orders: 9, revenue: 14750, height: "70%" },
  { hour: "7 PM", orders: 12, revenue: 21500, height: "100%" },
  { hour: "8 PM", orders: 8, revenue: 12800, height: "60%" },
];

export default function AdminDashboardPage() {
  const [selectedHourlyBar, setSelectedHourlyBar] = useState<number | null>(10); // Default 7 PM peak

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Page Header & Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h2 className="text-2xl font-black text-[#121212] tracking-tight">
              Good day, Owner!
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Here is your live restaurant performance for today,{" "}
            <span className="text-zinc-800 font-semibold">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center gap-1.5"
          >
            <span>📋</span>
            <span>Live Kitchen Feed</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Refresh dashboard stats"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Orders */}
        <StatCard
          title="Total Orders"
          value={MOCK_DASHBOARD_STATS.totalOrders}
          subtitle="All tickets today"
          icon="📦"
          accentColor="orange"
          trend={{ value: "+14% vs yesterday", isPositive: true }}
        />

        {/* 2. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatPrice(MOCK_DASHBOARD_STATS.totalRevenue)}
          subtitle="Net sales (incl. tax)"
          icon="💰"
          accentColor="green"
          trend={{ value: "+18% vs yesterday", isPositive: true }}
        />

        {/* 3. Average Order Value */}
        <StatCard
          title="Average Order"
          value={formatPrice(Math.round(MOCK_DASHBOARD_STATS.averageOrderValue))}
          subtitle="Per customer ticket"
          icon="🏷️"
          accentColor="zinc"
          trend={{ value: "Rs. 1,638.54 avg", isPositive: true }}
        />

        {/* 4. Completed Orders */}
        <StatCard
          title="Completed"
          value={MOCK_DASHBOARD_STATS.completedOrders}
          subtitle="Billed & closed"
          icon="✅"
          accentColor="gold"
          trend={{ value: "81% completion rate", isPositive: true }}
        />

        {/* 5. Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={MOCK_DASHBOARD_STATS.pendingOrders}
          subtitle="Active in kitchen"
          icon="⏳"
          accentColor="red"
          trend={{ value: "4 New • 5 Prep", isPositive: false }}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/menu/new"
            className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-[#FF6B2C]/40 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] group-hover:bg-[#FF6B2C] group-hover:text-white transition-all flex items-center justify-center text-xl font-bold flex-shrink-0">
              ➕
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#121212] group-hover:text-[#FF6B2C] transition-colors truncate">
                Add New Menu Item
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                Dish, pricing & variants
              </p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-all flex items-center justify-center text-xl font-bold flex-shrink-0">
              📋
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#121212] group-hover:text-[#198754] transition-colors truncate">
                View Live Orders
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                {MOCK_DASHBOARD_STATS.pendingOrders} tickets in kitchen
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F4B400] group-hover:bg-[#F4B400] group-hover:text-white transition-all flex items-center justify-center text-xl font-bold flex-shrink-0">
              🏷️
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#121212] group-hover:text-[#F4B400] transition-colors truncate">
                Manage Categories
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                Sort orders & menu groups
              </p>
            </div>
          </Link>

          <Link
            href="/admin/tables"
            className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center text-xl font-bold flex-shrink-0">
              🪑
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#121212] group-hover:text-blue-600 transition-colors truncate">
                Manage Tables & QR
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                Print QR tokens & seats
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Middle Section: Sales & Orders Today Chart + Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sales & Orders Today Chart Area (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#121212]">
                Sales & Orders Today
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Hourly transaction volume and revenue curve (9:00 AM – 9:00 PM)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B2C]" />
                Peak Hour: 7:00 PM
              </span>
              <span className="bg-emerald-50 text-[#198754] font-bold px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                Active Trading
              </span>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="pt-2">
            <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-zinc-200">
              {HOURLY_SALES_DATA.map((item, index) => {
                const isSelected = selectedHourlyBar === index;
                return (
                  <div
                    key={item.hour}
                    onClick={() => setSelectedHourlyBar(index)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                  >
                    {/* Tooltip on hover/select */}
                    <div
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all whitespace-nowrap ${
                        isSelected
                          ? "bg-[#121212] text-white opacity-100 -translate-y-1"
                          : "opacity-0 group-hover:opacity-100 bg-zinc-800 text-white"
                      }`}
                    >
                      {formatPrice(item.revenue)}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[32px] bg-zinc-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-40">
                      <div
                        style={{ height: item.height }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? "bg-[#FF6B2C] shadow-md shadow-[#FF6B2C]/40"
                            : "bg-[#FF6B2C]/75 group-hover:bg-[#FF6B2C]"
                        }`}
                      />
                    </div>

                    {/* Hour Label */}
                    <span
                      className={`text-[10px] font-semibold tracking-tight transition-colors ${
                        isSelected ? "text-[#FF6B2C] font-extrabold" : "text-zinc-500"
                      }`}
                    >
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Hour Summary Pill */}
            {selectedHourlyBar !== null && (
              <div className="mt-4 p-3 rounded-2xl bg-[#FAF7F2] border border-zinc-200/80 flex flex-wrap items-center justify-between text-xs font-semibold text-zinc-700">
                <span className="flex items-center gap-2">
                  <span className="text-base">🕒</span>
                  <span>Slot: {HOURLY_SALES_DATA[selectedHourlyBar].hour}</span>
                </span>
                <span>
                  Orders Placed:{" "}
                  <strong className="text-[#121212]">
                    {HOURLY_SALES_DATA[selectedHourlyBar].orders} orders
                  </strong>
                </span>
                <span>
                  Slot Revenue:{" "}
                  <strong className="text-[#FF6B2C]">
                    {formatPrice(HOURLY_SALES_DATA[selectedHourlyBar].revenue)}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Items (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#121212]">
                Top Selling Items
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Ranked by revenue</p>
            </div>
            <span className="text-xs font-bold text-zinc-400">Today</span>
          </div>

          <div className="space-y-3 pt-1">
            {MOCK_TOP_ITEMS.map((item, index) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 transition-colors border border-zinc-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-white border border-zinc-200 text-zinc-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#121212] truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {item.qty} units sold
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <p className="text-xs font-extrabold text-[#121212]">
                    {formatPrice(item.revenue)}
                  </p>
                  <span
                    className={`text-[10px] font-bold ${
                      item.trend === "up"
                        ? "text-emerald-600"
                        : item.trend === "down"
                        ? "text-rose-600"
                        : "text-zinc-400"
                    }`}
                  >
                    {item.trend === "up"
                      ? "↑ Rising"
                      : item.trend === "down"
                      ? "↓ Lower"
                      : "• Stable"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/reports"
            className="block text-center pt-2 text-xs font-bold text-[#FF6B2C] hover:text-[#E55A1F] transition-colors"
          >
            View Full Sales Report →
          </Link>
        </div>
      </div>

      {/* Recent Active Orders Section */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#121212]">
                Recent Active Orders
              </h3>
              <span className="bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                {MOCK_RECENT_ORDERS.filter((o) => o.status === "RECEIVED").length} New
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Live orders flowing from customer tables to kitchen
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#FF6B2C] hover:text-[#E55A1F] flex items-center gap-1"
          >
            <span>Open All Orders</span>
            <span>→</span>
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Table</th>
                <th className="py-3 px-3">Ordered Items</th>
                <th className="py-3 px-3">Placed</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {MOCK_RECENT_ORDERS.map((order) => {
                const elapsedMin = Math.round(
                  (Date.now() - order.createdAt) / (1000 * 60)
                );

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-sm text-[#121212]">
                        #{order.id}
                      </span>
                    </td>

                    {/* Table Label */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-zinc-200 font-bold text-zinc-800">
                        {order.tableLabel}
                      </span>
                    </td>

                    {/* Ordered Items summary */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <p className="text-xs text-[#121212] font-semibold truncate">
                        {order.lines.map((l) => `${l.name} x${l.qty}`).join(", ")}
                      </p>
                      {order.lines.some((l) => l.note) && (
                        <p className="text-[11px] text-amber-700 italic truncate">
                          Note: {order.lines.find((l) => l.note)?.note}
                        </p>
                      )}
                    </td>

                    {/* Time Elapsed */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      {elapsedMin <= 1 ? "Just now" : `${elapsedMin}m ago`}
                    </td>

                    {/* Order Total formatted with formatPrice() */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-extrabold text-[#121212]">
                      {formatPrice(order.total)}
                    </td>

                    {/* Order Status Badge */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
