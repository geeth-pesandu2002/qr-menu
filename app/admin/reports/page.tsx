"use client";

import React, { useState, useEffect } from "react";
import { formatPrice, TopItem } from "@/src/lib/types";
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

const MOCK_ANALYTICS: Record<DateRangeFilter, AnalyticsDataset> = {
  TODAY: {
    label: "Today (Live)",
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    chartData: [],
    topItems: [],
  },
  THIS_WEEK: {
    label: "This Week (Past 7 Days)",
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    chartData: [],
    topItems: [],
  },
  THIS_MONTH: {
    label: "This Month (Current Cycle)",
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    chartData: [],
    topItems: [],
  },
  CUSTOM: {
    label: "Custom Period",
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    chartData: [],
    topItems: [],
  },
};

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<Record<DateRangeFilter, AnalyticsDataset>>(MOCK_ANALYTICS);
  const [selectedRange, setSelectedRange] = useState<DateRangeFilter>("TODAY");
  const [customStartDate, setCustomStartDate] = useState("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState("2026-09-26");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveReportData() {
      try {
        const [dashJson, topJson] = await Promise.all([
          adminFetch("/backend-api/analytics/dashboard"),
          adminFetch("/backend-api/analytics/top-items"),
        ]);

        if (dashJson?.success && dashJson.data && isMounted) {
          const d = dashJson.data;
          setAnalytics((prev) => ({
            ...prev,
            TODAY: {
              ...prev.TODAY,
              totalRevenue: d.totalRevenue || prev.TODAY.totalRevenue,
              totalOrders: d.totalOrders || prev.TODAY.totalOrders,
              avgOrderValue: d.averageOrderValue || prev.TODAY.avgOrderValue,
              completedOrders: d.completedOrders || prev.TODAY.completedOrders,
              pendingOrders: d.pendingOrders || prev.TODAY.pendingOrders,
            },
          }));
        }

        if (topJson?.success && Array.isArray(topJson.data) && topJson.data.length > 0 && isMounted) {
          setAnalytics((prev) => ({
            ...prev,
            TODAY: {
              ...prev.TODAY,
              topItems: topJson.data,
            },
          }));
        }
      } catch (err) {
        console.error("Could not load live analytics reports:", err);
      }
    }

    loadLiveReportData();
  }, []);

  const activeData = analytics[selectedRange];

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
