"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatPrice, TopItem, Order } from "@/src/lib/types";
import StatCard from "@/src/components/admin/dashboard/StatCard";
import RevenueChart, { ChartDataPoint } from "@/src/components/admin/reports/RevenueChart";
import TopItemsReport from "@/src/components/admin/reports/TopItemsReport";
import { adminFetch } from "@/src/lib/admin-api";

type DateRangeFilter = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";

interface AnalyticsDataset {
  label: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  chartData: ChartDataPoint[];
  topItems: TopItem[];
}

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState<DateRangeFilter>("TODAY");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [backendTopItems, setBackendTopItems] = useState<TopItem[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const loadLiveReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashJson, topJson, ordersJson] = await Promise.all([
        adminFetch("/backend-api/analytics/dashboard"),
        adminFetch("/backend-api/analytics/top-items"),
        adminFetch("/backend-api/orders"),
      ]);

      if (dashJson?.success && dashJson.data) {
        setDashboardStats(dashJson.data);
      }
      if (topJson?.success && Array.isArray(topJson.data)) {
        setBackendTopItems(topJson.data);
      }
      if (ordersJson?.success && Array.isArray(ordersJson.data)) {
        setAllOrders(ordersJson.data);
      }
    } catch (err: any) {
      console.error("Could not load live analytics reports:", err);
      setError(err?.message || "Failed to load live analytics reports from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveReportData();
  }, []);

  // Compute active dataset based on real orders & stats
  const activeData: AnalyticsDataset = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    let rangeLabel = "Today (Live)";
    let filtered = allOrders;

    if (selectedRange === "TODAY") {
      rangeLabel = "Today (Live)";
      filtered = allOrders.filter((o) => {
        const time = o.createdAt || 0;
        return time >= startOfToday && time <= endOfToday;
      });
    } else if (selectedRange === "THIS_WEEK") {
      rangeLabel = "This Week (Past 7 Days)";
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      filtered = allOrders.filter((o) => (o.createdAt || 0) >= sevenDaysAgo);
    } else if (selectedRange === "THIS_MONTH") {
      rangeLabel = "This Month (Current Cycle)";
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      filtered = allOrders.filter((o) => (o.createdAt || 0) >= startOfMonth);
    } else if (selectedRange === "CUSTOM") {
      rangeLabel = `Custom (${customStartDate} to ${customEndDate})`;
      const startCustom = new Date(customStartDate).getTime();
      const endCustom = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      filtered = allOrders.filter((o) => {
        const time = o.createdAt || 0;
        return time >= startCustom && time <= endCustom;
      });
    }

    // Top items aggregation from filtered orders (or backendTopItems for TODAY if available)
    let topItems = backendTopItems;
    if (selectedRange !== "TODAY" || backendTopItems.length === 0) {
      const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
      filtered.forEach((order) => {
        (order.lines || []).forEach((line) => {
          const key = line.itemId || line.name;
          const existing = itemMap.get(key) || {
            name: line.name,
            qty: 0,
            revenue: 0,
          };
          existing.qty += line.qty || 1;
          existing.revenue += (line.unitPrice || 0) * (line.qty || 1);
          itemMap.set(key, existing);
        });
      });
      topItems = Array.from(itemMap.entries())
        .map(([itemId, val]) => ({
          itemId,
          name: val.name,
          qty: val.qty,
          revenue: val.revenue,
          trend: "stable" as const,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    // Chart points aggregation
    let chartData: ChartDataPoint[] = [];
    if (filtered.length > 0) {
      if (selectedRange === "TODAY") {
        const hourlyBuckets: Record<string, { revenue: number; orders: number }> = {
          "10:00": { revenue: 0, orders: 0 },
          "12:00": { revenue: 0, orders: 0 },
          "14:00": { revenue: 0, orders: 0 },
          "16:00": { revenue: 0, orders: 0 },
          "18:00": { revenue: 0, orders: 0 },
          "20:00": { revenue: 0, orders: 0 },
          "22:00": { revenue: 0, orders: 0 },
        };
        filtered.forEach((order) => {
          const hour = new Date(order.createdAt || 0).getHours();
          const bucket =
            hour < 11
              ? "10:00"
              : hour < 13
              ? "12:00"
              : hour < 15
              ? "14:00"
              : hour < 17
              ? "16:00"
              : hour < 19
              ? "18:00"
              : hour < 21
              ? "20:00"
              : "22:00";
          hourlyBuckets[bucket].revenue += order.total || 0;
          hourlyBuckets[bucket].orders += 1;
        });
        chartData = Object.entries(hourlyBuckets).map(([label, b]) => ({
          label,
          revenue: b.revenue,
          orders: b.orders,
        }));
      } else if (selectedRange === "THIS_WEEK") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayBuckets: Record<string, { revenue: number; orders: number }> = {};
        days.forEach((d) => {
          dayBuckets[d] = { revenue: 0, orders: 0 };
        });
        filtered.forEach((order) => {
          const dName = days[new Date(order.createdAt || 0).getDay()];
          dayBuckets[dName].revenue += order.total || 0;
          dayBuckets[dName].orders += 1;
        });
        chartData = days.map((d) => ({
          label: d,
          revenue: dayBuckets[d].revenue,
          orders: dayBuckets[d].orders,
        }));
      } else {
        // Group by date
        const dateMap = new Map<string, { revenue: number; orders: number }>();
        filtered.forEach((order) => {
          const dStr = new Date(order.createdAt || 0).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const curr = dateMap.get(dStr) || { revenue: 0, orders: 0 };
          curr.revenue += order.total || 0;
          curr.orders += 1;
          dateMap.set(dStr, curr);
        });
        chartData = Array.from(dateMap.entries()).map(([label, b]) => ({
          label,
          revenue: b.revenue,
          orders: b.orders,
        }));
      }
    }

    // Totals
    let totalRevenue = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    if (selectedRange === "TODAY" && dashboardStats) {
      totalRevenue = dashboardStats.totalRevenue ?? 0;
      totalOrders = dashboardStats.totalOrders ?? 0;
      completedOrders = dashboardStats.completedOrders ?? 0;
      pendingOrders = dashboardStats.pendingOrders ?? 0;
    } else {
      totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);
      totalOrders = filtered.length;
      completedOrders = filtered.filter((o) =>
        ["COMPLETED", "SERVED", "DELIVERED"].includes(o.status)
      ).length;
      pendingOrders = filtered.filter((o) =>
        ["PENDING", "PREPARING", "CONFIRMED"].includes(o.status)
      ).length;
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      label: rangeLabel,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completedOrders,
      pendingOrders,
      chartData,
      topItems,
    };
  }, [allOrders, selectedRange, customStartDate, customEndDate, dashboardStats, backendTopItems]);

  const handleExport = () => {
    try {
      const rows = [
        ["Metric", "Value"],
        ["Date Range", activeData.label],
        ["Total Revenue", `${activeData.totalRevenue}`],
        ["Total Orders", `${activeData.totalOrders}`],
        ["Average Order Value", `${Math.round(activeData.avgOrderValue)}`],
        ["Completed Orders", `${activeData.completedOrders}`],
        ["Pending Orders", `${activeData.pendingOrders}`],
        [],
        ["Top Selling Item", "Quantity", "Revenue"],
        ...activeData.topItems.map((item) => [item.name, `${item.qty}`, `${item.revenue}`]),
      ];
      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `dinego_report_${selectedRange.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportNotice(`Exported report (${activeData.label}) to CSV successfully!`);
    } catch (e) {
      console.warn("Export error:", e);
      setExportNotice("Export completed.");
    }
    setTimeout(() => {
      setExportNotice(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Error Notice Notification Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-black font-bold text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Track gross sales, order volume performance, and customer menu preferences
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Preset Selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedRange("TODAY")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRange === "TODAY"
                  ? "bg-white text-[#121212] shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange("THIS_WEEK")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRange === "THIS_WEEK"
                  ? "bg-white text-[#121212] shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange("THIS_MONTH")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRange === "THIS_MONTH"
                  ? "bg-white text-[#121212] shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange("CUSTOM")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRange === "CUSTOM"
                  ? "bg-white text-[#121212] shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadLiveReportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all shadow-xs"
            title="Refresh analytics data"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Report */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-extrabold text-zinc-700 transition-all shadow-xs"
            title="Download CSV report"
          >
            <svg
              className="w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export (CSV)
          </button>
        </div>
      </div>

      {/* Export Notice Notification Banner */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-amber-800 hover:text-black font-bold text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Date Range Picker Strip (if CUSTOM is selected) */}
      {selectedRange === "CUSTOM" && (
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-xl font-medium text-zinc-800 focus:outline-none focus:border-[#FF6B2C]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-xl font-medium text-zinc-800 focus:outline-none focus:border-[#FF6B2C]"
            />
          </div>
          <span className="text-zinc-400 italic">
            Filtering real records for custom selection
          </span>
        </div>
      )}

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={isLoading ? "..." : formatPrice(activeData.totalRevenue)}
          subtitle={activeData.label}
          icon="💰"
          accentColor="orange"
        />

        {/* 2. Total Orders */}
        <StatCard
          title="Total Orders"
          value={isLoading ? "..." : activeData.totalOrders.toLocaleString()}
          subtitle="Orders placed"
          icon="📦"
          accentColor="green"
        />

        {/* 3. Average Order Value */}
        <StatCard
          title="Avg Order Value"
          value={isLoading ? "..." : formatPrice(activeData.avgOrderValue)}
          subtitle="Per completed order"
          icon="📊"
          accentColor="gold"
        />

        {/* 4. Completed Orders */}
        <StatCard
          title="Completed"
          value={isLoading ? "..." : activeData.completedOrders.toLocaleString()}
          subtitle="Fulfilled tickets"
          icon="✅"
          accentColor="zinc"
        />

        {/* 5. Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={isLoading ? "..." : activeData.pendingOrders.toLocaleString()}
          subtitle="In kitchen/floor"
          icon="⏳"
          accentColor="red"
        />
      </div>

      {/* Sales & Orders Chart Visualization */}
      <RevenueChart
        data={activeData.chartData}
        dateRangeLabel={activeData.label}
      />

      {/* Top Selling Items Panel */}
      <TopItemsReport items={activeData.topItems} />
    </div>
  );
}
