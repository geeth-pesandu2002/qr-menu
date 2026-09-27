"use client";

import React, { useState } from "react";
import { formatPrice } from "@/src/lib/types";

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  dateRangeLabel: string;
}

export default function RevenueChart({
  data,
  dateRangeLabel,
}: RevenueChartProps) {
  const [metricMode, setMetricMode] = useState<"REVENUE" | "ORDERS">("REVENUE");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute maximums for relative bar heights
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const maxOrders = Math.max(...data.map((d) => d.orders), 5);

  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#121212]">
              Sales & Orders Trend
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF7F2] border border-zinc-200 text-zinc-600">
              {dateRangeLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Hourly & periodic breakdown of gross revenue and ticket volume
          </p>
        </div>

        {/* Metric Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMetricMode("REVENUE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metricMode === "REVENUE"
                ? "bg-white text-[#121212] shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            💰 Revenue (Rs.)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("ORDERS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metricMode === "ORDERS"
                ? "bg-white text-[#121212] shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            📦 Order Volume
          </button>
        </div>
      </div>

      {/* Chart Visual Canvas */}
      <div className="space-y-4">
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-zinc-200 pt-6">
          {data.map((point, index) => {
            const isHovered = hoveredIndex === index;
            const heightPercent =
              metricMode === "REVENUE"
                ? Math.round((point.revenue / maxRevenue) * 100)
                : Math.round((point.orders / maxOrders) * 100);

            return (
              <div
                key={point.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end relative"
              >
                {/* Floating Tooltip */}
                <div
                  className={`absolute -top-12 z-20 pointer-events-none transition-all duration-150 ${
                    isHovered
                      ? "opacity-100 scale-100 -translate-y-1"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <div className="bg-[#121212] text-white px-2.5 py-1.5 rounded-xl text-center shadow-xl border border-zinc-700 whitespace-nowrap space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-semibold">{point.label}</p>
                    <p className="text-xs font-bold text-[#FF6B2C]">
                      {formatPrice(point.revenue)}
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">
                      {point.orders} orders
                    </p>
                  </div>
                </div>

                {/* Animated Bar */}
                <div className="w-full max-w-[42px] bg-zinc-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-48">
                  <div
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      metricMode === "REVENUE"
                        ? isHovered
                          ? "bg-[#FF6B2C] shadow-lg shadow-[#FF6B2C]/40"
                          : "bg-[#FF6B2C]/80 group-hover:bg-[#FF6B2C]"
                        : isHovered
                        ? "bg-[#198754] shadow-lg shadow-emerald-500/40"
                        : "bg-[#198754]/80 group-hover:bg-[#198754]"
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-semibold tracking-tight transition-colors truncate max-w-[50px] text-center ${
                    isHovered
                      ? "text-[#FF6B2C] font-extrabold"
                      : "text-zinc-500"
                  }`}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Interactive Period Total Footer */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-zinc-200/80 flex flex-wrap items-center justify-between text-xs font-semibold text-zinc-700 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6B2C]" />
            <span>
              Total Period Revenue:{" "}
              <strong className="text-[#121212]">
                {formatPrice(totalPeriodRevenue)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#198754]" />
            <span>
              Total Orders Processed:{" "}
              <strong className="text-[#121212]">{totalPeriodOrders} tickets</strong>
            </span>
          </div>

          <span className="text-zinc-400 font-normal text-[11px]">
            Hover over any bar to inspect specific intervals
          </span>
        </div>
      </div>
    </div>
  );
}
