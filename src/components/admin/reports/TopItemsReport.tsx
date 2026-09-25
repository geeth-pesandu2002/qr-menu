"use client";

import React from "react";
import { TopItem, formatPrice } from "@/src/lib/types";

interface TopItemsReportProps {
  items: TopItem[];
}

export default function TopItemsReport({ items }: TopItemsReportProps) {
  const maxRevenue = Math.max(...items.map((i) => i.revenue), 1);
  const totalRevenue = items.reduce((sum, i) => sum + i.revenue, 0);

  const getTrendBadge = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            Up
          </span>
        );
      case "down":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>
            Down
          </span>
        );
      case "stable":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
            Stable
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#121212]">
            Top Selling Dishes
          </h3>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Ranked by customer demand and sales volume in the selected timeframe
          </p>
        </div>
        <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full self-start sm:self-auto">
          {items.length} dishes tracked
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm">
          No sales recorded for this timeframe yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="pb-3 pl-2 w-12 text-center">#</th>
                <th className="pb-3">Menu Item</th>
                <th className="pb-3 text-right">Units Sold</th>
                <th className="pb-3 text-right">Gross Revenue</th>
                <th className="pb-3 text-center w-28">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item, idx) => {
                const revenueShare =
                  totalRevenue > 0
                    ? Math.round((item.revenue / totalRevenue) * 100)
                    : 0;

                return (
                  <tr
                    key={item.itemId}
                    className="hover:bg-[#FAF7F2]/60 transition-colors group"
                  >
                    {/* Rank Badge */}
                    <td className="py-4 pl-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                          idx === 0
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : idx === 1
                            ? "bg-zinc-200 text-zinc-700"
                            : idx === 2
                            ? "bg-amber-50 text-amber-800"
                            : "text-zinc-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    {/* Dish Name & Share Bar */}
                    <td className="py-4 pr-4">
                      <div className="space-y-1">
                        <span className="font-extrabold text-[#121212] group-hover:text-[#FF6B2C] transition-colors block text-sm">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="flex-1 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FF6B2C] h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(
                                  4,
                                  Math.round((item.revenue / maxRevenue) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-semibold whitespace-nowrap">
                            {revenueShare}% share
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Units Sold */}
                    <td className="py-4 text-right font-bold text-zinc-700">
                      {item.qty.toLocaleString()}{" "}
                      <span className="text-zinc-400 font-normal text-xs">
                        units
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-4 text-right">
                      <span className="font-extrabold text-[#121212] text-sm">
                        {formatPrice(item.revenue)}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-4 text-center">
                      {getTrendBadge(item.trend)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
