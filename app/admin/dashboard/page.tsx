"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DashboardStats,
  TopItem,
  Order,
  formatPrice,
} from "@/src/lib/types";
import StatCard from "@/src/components/admin/dashboard/StatCard";
import OrderStatusBadge from "@/src/components/admin/orders/OrderStatusBadge";
import { adminFetch } from "@/src/lib/admin-api";

// Dashboard initial statistics matching DashboardStats interface
const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  completedOrders: 0,
  pendingOrders: 0,
  dateRange: {
    start: 0,
    end: 0,
  },
};

// Hourly labels for today's sales & orders chart
const CHART_HOURS = [
  "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM",
  "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM",
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_DASHBOARD_STATS);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHourlyBar, setSelectedHourlyBar] = useState<number | null>(null);

  const loadDashboard = async () => {
    try {
      const [statsJson, ordersJson, topJson] = await Promise.all([
        adminFetch("/backend-api/analytics/dashboard"),
        adminFetch("/backend-api/orders"),
        adminFetch("/backend-api/analytics/top-items"),
      ]);
      if (statsJson?.success && statsJson?.data) {
        setStats(statsJson.data);
      }
      if (ordersJson?.success && Array.isArray(ordersJson?.data)) {
        setRecentOrders(ordersJson.data.slice(0, 8));
      }
      if (topJson?.success && Array.isArray(topJson?.data)) {
        setTopItems(topJson.data);
      }
      setError(null);
    } catch (err: any) {
      console.error("Could not load live analytics:", err);
      setError(err?.message || "Failed to load live analytics from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 8000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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

      {/* Error Notification Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="px-3 py-1 bg-white rounded-xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Orders */}
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All tickets today"
          icon="📦"
          accentColor="orange"
        />

        {/* 2. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          subtitle="Net sales (incl. tax)"
          icon="💰"
          accentColor="green"
        />

        {/* 3. Average Order Value */}
        <StatCard
          title="Average Order"
          value={formatPrice(Math.round(stats.averageOrderValue || 0))}
          subtitle="Per customer ticket"
          icon="🏷️"
          accentColor="zinc"
        />

        {/* 4. Completed Orders */}
        <StatCard
          title="Completed"
          value={stats.completedOrders}
          subtitle="Billed & closed"
          icon="✅"
          accentColor="gold"
          trend={
            stats.totalOrders > 0
              ? {
                  value: `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}% completion rate`,
                  isPositive: true,
                }
              : undefined
          }
        />

        {/* 5. Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Active in kitchen"
          icon="⏳"
          accentColor="red"
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
                {stats.pendingOrders} tickets in kitchen
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
              <span className="bg-emerald-50 text-[#198754] font-bold px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                Active Trading
              </span>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="pt-2">
            {(() => {
              const maxHourlyRevenue = Math.max(
                ...CHART_HOURS.map((_, i) => {
                  const targetHour = i + 9;
                  return recentOrders
                    .filter((o) => new Date(o.createdAt).getHours() === targetHour)
                    .reduce((sum, o) => sum + o.total, 0);
                }),
                1
              );

              const hourlyData = CHART_HOURS.map((hour, i) => {
                const targetHour = i + 9;
                const slotOrders = recentOrders.filter(
                  (o) => new Date(o.createdAt).getHours() === targetHour
                );
                const revenue = slotOrders.reduce((sum, o) => sum + o.total, 0);
                const heightPercent =
                  revenue > 0 ? Math.max(8, Math.round((revenue / maxHourlyRevenue) * 100)) : 4;
                return {
                  hour,
                  orders: slotOrders.length,
                  revenue,
                  height: `${heightPercent}%`,
                };
              });

              return (
                <>
                  <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-zinc-200">
                    {hourlyData.map((item, index) => {
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
                        <span>Slot: {hourlyData[selectedHourlyBar].hour}</span>
                      </span>
                      <span>
                        Orders Placed:{" "}
                        <strong className="text-[#121212]">
                          {hourlyData[selectedHourlyBar].orders} orders
                        </strong>
                      </span>
                      <span>
                        Slot Revenue:{" "}
                        <strong className="text-[#FF6B2C]">
                          {formatPrice(hourlyData[selectedHourlyBar].revenue)}
                        </strong>
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
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
            {topItems.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs font-semibold">
                No top selling items recorded yet today.
              </div>
            ) : (
              topItems.map((item, index) => (
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
                  </div>
                </div>
              ))
            )}
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
                {recentOrders.filter((o) => o.status === "RECEIVED").length} New
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-zinc-400 font-semibold text-xs"
                  >
                    No recent active orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
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
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
