"use client";

import React, { useState } from "react";
import { formatPrice, TopItem } from "@/src/lib/types";
import StatCard from "@/src/components/admin/dashboard/StatCard";
import RevenueChart, { ChartDataPoint } from "@/src/components/admin/reports/RevenueChart";
import TopItemsReport from "@/src/components/admin/reports/TopItemsReport";

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

const MOCK_ANALYTICS: Record<DateRangeFilter, AnalyticsDataset> = {
  TODAY: {
    label: "Today (Live)",
    totalRevenue: 48250,
    totalOrders: 38,
    avgOrderValue: 1269.74,
    completedOrders: 34,
    pendingOrders: 4,
    chartData: [
      { label: "11 AM", revenue: 4200, orders: 3 },
      { label: "1 PM", revenue: 14500, orders: 11 },
      { label: "3 PM", revenue: 5800, orders: 5 },
      { label: "5 PM", revenue: 6250, orders: 5 },
      { label: "7 PM", revenue: 11200, orders: 9 },
      { label: "9 PM", revenue: 6300, orders: 5 },
    ],
    topItems: [
      { itemId: "item-1", name: "Classic Chicken Burger", qty: 16, revenue: 15200, trend: "up" },
      { itemId: "item-2", name: "Chicken Cheese Kottu", qty: 12, revenue: 11400, trend: "up" },
      { itemId: "item-3", name: "BBQ Crispy Chicken Wings", qty: 10, revenue: 7500, trend: "stable" },
      { itemId: "item-4", name: "Iced Vanilla Latte", qty: 8, revenue: 4400, trend: "up" },
      { itemId: "item-5", name: "Garlic French Fries", qty: 7, revenue: 3150, trend: "down" },
    ],
  },
  THIS_WEEK: {
    label: "This Week (Past 7 Days)",
    totalRevenue: 284500,
    totalOrders: 215,
    avgOrderValue: 1323.25,
    completedOrders: 198,
    pendingOrders: 17,
    chartData: [
      { label: "Mon", revenue: 32000, orders: 25 },
      { label: "Tue", revenue: 35400, orders: 27 },
      { label: "Wed", revenue: 29800, orders: 22 },
      { label: "Thu", revenue: 41200, orders: 31 },
      { label: "Fri", revenue: 52100, orders: 39 },
      { label: "Sat", revenue: 56500, orders: 42 },
      { label: "Sun", revenue: 37500, orders: 29 },
    ],
    topItems: [
      { itemId: "item-1", name: "Classic Chicken Burger", qty: 88, revenue: 83600, trend: "up" },
      { itemId: "item-2", name: "Chicken Cheese Kottu", qty: 64, revenue: 60800, trend: "up" },
      { itemId: "item-3", name: "BBQ Crispy Chicken Wings", qty: 52, revenue: 39000, trend: "stable" },
      { itemId: "item-4", name: "Iced Vanilla Latte", qty: 45, revenue: 24750, trend: "up" },
      { itemId: "item-5", name: "Cheesy Garlic Bread", qty: 38, revenue: 20900, trend: "down" },
    ],
  },
  THIS_MONTH: {
    label: "This Month (Current Cycle)",
    totalRevenue: 1142800,
    totalOrders: 864,
    avgOrderValue: 1322.68,
    completedOrders: 825,
    pendingOrders: 39,
    chartData: [
      { label: "Week 1", revenue: 265000, orders: 198 },
      { label: "Week 2", revenue: 282000, orders: 214 },
      { label: "Week 3", revenue: 301500, orders: 228 },
      { label: "Week 4", revenue: 294300, orders: 224 },
    ],
    topItems: [
      { itemId: "item-1", name: "Classic Chicken Burger", qty: 340, revenue: 323000, trend: "up" },
      { itemId: "item-2", name: "Chicken Cheese Kottu", qty: 255, revenue: 242250, trend: "up" },
      { itemId: "item-3", name: "BBQ Crispy Chicken Wings", qty: 190, revenue: 142500, trend: "stable" },
      { itemId: "item-4", name: "Iced Vanilla Latte", qty: 168, revenue: 92400, trend: "stable" },
      { itemId: "item-5", name: "Loaded Beef Burger", qty: 112, revenue: 117600, trend: "down" },
    ],
  },
  CUSTOM: {
    label: "Custom Period",
    totalRevenue: 640000,
    totalOrders: 480,
    avgOrderValue: 1333.33,
    completedOrders: 460,
    pendingOrders: 20,
    chartData: [
      { label: "Day 1-5", revenue: 155000, orders: 115 },
      { label: "Day 6-10", revenue: 162000, orders: 122 },
      { label: "Day 11-15", revenue: 173000, orders: 130 },
      { label: "Day 16-20", revenue: 150000, orders: 113 },
    ],
    topItems: [
      { itemId: "item-1", name: "Classic Chicken Burger", qty: 185, revenue: 175750, trend: "up" },
      { itemId: "item-2", name: "Chicken Cheese Kottu", qty: 142, revenue: 134900, trend: "stable" },
      { itemId: "item-3", name: "BBQ Crispy Chicken Wings", qty: 104, revenue: 78000, trend: "up" },
      { itemId: "item-4", name: "Iced Vanilla Latte", qty: 95, revenue: 52250, trend: "down" },
      { itemId: "item-5", name: "Mango Passion Smoothie", qty: 68, revenue: 37400, trend: "stable" },
    ],
  },
};

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState<DateRangeFilter>("THIS_WEEK");
  const [customStartDate, setCustomStartDate] = useState("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState("2026-09-26");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeData = MOCK_ANALYTICS[selectedRange];

  const handleExport = () => {
    setExportNotice("Exporting reports (CSV/PDF) will be available once production analytics APIs are integrated.");
    setTimeout(() => {
      setExportNotice(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
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

          {/* Export Report (Mock UI) */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-extrabold text-zinc-700 transition-all shadow-xs"
            title="Download CSV report (Demo UI)"
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
            Displaying mock aggregation for custom selection
          </span>
        </div>
      )}

      {/* 5 Required Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatPrice(activeData.totalRevenue)}
          subtitle={activeData.label}
          icon="💰"
          trend={{ value: "+14% vs prev", isPositive: true }}
          accentColor="orange"
        />

        {/* 2. Total Orders */}
        <StatCard
          title="Total Orders"
          value={activeData.totalOrders.toLocaleString()}
          subtitle="Orders placed"
          icon="📦"
          trend={{ value: "+8% vs prev", isPositive: true }}
          accentColor="green"
        />

        {/* 3. Average Order Value */}
        <StatCard
          title="Avg Order Value"
          value={formatPrice(activeData.avgOrderValue)}
          subtitle="Per completed order"
          icon="📊"
          trend={{ value: "+4.2% healthy", isPositive: true }}
          accentColor="gold"
        />

        {/* 4. Completed Orders */}
        <StatCard
          title="Completed"
          value={activeData.completedOrders.toLocaleString()}
          subtitle="Fulfilled tickets"
          icon="✅"
          trend={{ value: "95% rate", isPositive: true }}
          accentColor="zinc"
        />

        {/* 5. Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={activeData.pendingOrders.toLocaleString()}
          subtitle="In kitchen/floor"
          icon="⏳"
          trend={{ value: "In progress", isPositive: false }}
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
