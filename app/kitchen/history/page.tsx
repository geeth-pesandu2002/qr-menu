"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useKitchen } from "@/src/context/KitchenContext";
import { formatPrice, Order } from "@/src/lib/types";

export default function KitchenOrderHistoryPage() {
  const { getAuthToken } = useKitchen();
  const [filterRange, setFilterRange] = useState("all");
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const token = await getAuthToken();
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";

      let queryParams = "";
      const now = new Date();
      if (filterRange === "today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const end = start + 86400000 - 1;
        queryParams = `?startDate=${start}&endDate=${end}`;
      } else if (filterRange === "yesterday") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
        const end = start + 86400000 - 1;
        queryParams = `?startDate=${start}&endDate=${end}`;
      } else if (filterRange === "7days") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
        const end = now.getTime();
        queryParams = `?startDate=${start}&endDate=${end}`;
      }

      const res = await fetch(`${apiBase}/orders${queryParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setHistoryOrders(json.data);
        } else {
          setHistoryOrders([]);
        }
      } else {
        throw new Error(`Failed to load history (${res.status})`);
      }
    } catch (err: any) {
      console.warn("Kitchen history fetch error:", err);
      setFetchError(err.message || "Failed to load order history");
    } finally {
      setIsLoading(false);
    }
  }, [filterRange, getAuthToken]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const completedList = historyOrders.filter(
    (o) => o.status === "SERVED" || o.status === "COMPLETED"
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#121212]">Order History</h1>
          <p className="text-xs text-zinc-500 font-medium">
            Past kitchen orders log and timestamps from live backend
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              📅
            </span>
            <select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#121212] focus:outline-none focus:border-[#FF6B2C] cursor-pointer"
            >
              <option value="all">All History</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
            </select>
          </div>

          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh history"
          >
            {isLoading ? "⏳" : "🔄"}
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadHistory}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-[#FAF7F2] border-b border-zinc-200 text-[#121212] font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6">Order #</th>
                <th className="py-4 px-6">Table</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-semibold">
                    <div className="w-6 h-6 border-2 border-[#FF6B2C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading completed orders from backend...</span>
                  </td>
                </tr>
              ) : completedList.length > 0 ? (
                completedList.map((order) => {
                  const itemCount = order.lines.reduce((acc, l) => acc + l.qty, 0);
                  const isCompleted = order.status === "COMPLETED";

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-[#121212]">
                        #{order.id}
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {order.tableLabel || `Table ${order.tableId}`}
                      </td>
                      <td className="py-4 px-6">{itemCount} items</td>
                      <td className="py-4 px-6 font-extrabold text-[#121212]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Served"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-500" suppressHydrationWarning>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/kitchen/orders/${order.id}`}
                          className="text-[#FF6B2C] hover:underline font-bold"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-medium">
                    No completed or served orders found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Summary Controls */}
        <div className="bg-[#FAF7F2] border-t border-zinc-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium">
            Showing {completedList.length > 0 ? `1 to ${completedList.length}` : "0"} of{" "}
            {completedList.length} orders
          </span>
          {completedList.length > 0 && (
            <div className="flex items-center gap-1 font-bold">
              <button
                disabled
                className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 opacity-60"
              >
                ‹
              </button>
              <button className="w-7 h-7 rounded-lg bg-[#FF6B2C] text-white flex items-center justify-center">
                1
              </button>
              <button
                disabled
                className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 opacity-60"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
