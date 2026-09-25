"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useKitchen } from "@/src/context/KitchenContext";
import { formatPrice } from "@/src/lib/types";

const FALLBACK_HISTORY_ORDERS = [
  { id: "#1001", table: "05", items: 3, total: 2000, status: "Served", time: "12:45 PM" },
  { id: "#1000", table: "02", items: 2, total: 1650, status: "Served", time: "12:40 PM" },
  { id: "#0099", table: "08", items: 2, total: 1800, status: "Served", time: "12:35 PM" },
  { id: "#0098", table: "03", items: 2, total: 1650, status: "Served", time: "12:30 PM" },
  { id: "#0097", table: "06", items: 2, total: 1750, status: "Served", time: "12:20 PM" },
  { id: "#0096", table: "02", items: 2, total: 1100, status: "Served", time: "12:15 PM" },
];

export default function KitchenOrderHistoryPage() {
  const { kitchenOrders } = useKitchen();
  const [selectedDate, setSelectedDate] = useState("12 May 2025");

  const completedList = kitchenOrders.filter(
    (o) => o.status === "SERVED" || o.status === "COMPLETED"
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#121212]">Order History</h1>
          <p className="text-xs text-zinc-500 font-medium">
            Past kitchen orders log and timestamps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              📅
            </span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
            >
              <option value="12 May 2025">12 May 2025</option>
              <option value="11 May 2025">11 May 2025</option>
              <option value="10 May 2025">10 May 2025</option>
            </select>
          </div>
        </div>
      </div>

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
              {completedList.length > 0
                ? completedList.map((order) => {
                    const itemCount = order.lines.reduce((acc, l) => acc + l.qty, 0);
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-4 px-6 font-extrabold text-[#121212]">
                          #{order.id}
                        </td>
                        <td className="py-4 px-6 font-bold">{order.tableId}</td>
                        <td className="py-4 px-6">{itemCount} items</td>
                        <td className="py-4 px-6 font-extrabold text-[#121212]">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                            Served
                          </span>
                        </td>
                        <td className="py-4 px-6 text-zinc-500" suppressHydrationWarning>
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                : FALLBACK_HISTORY_ORDERS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-[#121212]">{item.id}</td>
                      <td className="py-4 px-6 font-bold">{item.table}</td>
                      <td className="py-4 px-6">{item.items} items</td>
                      <td className="py-4 px-6 font-extrabold text-[#121212]">
                        {formatPrice(item.total)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-500">{item.time}</td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/kitchen/orders/${item.id.replace("#", "")}`}
                          className="text-[#FF6B2C] hover:underline font-bold"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-[#FAF7F2] border-t border-zinc-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium">Showing 1 to 6 of 24 orders</span>
          <div className="flex items-center gap-1 font-bold">
            <button className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
              ‹
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#FF6B2C] text-white flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
              2
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
              3
            </button>
            <span className="px-1 text-zinc-400">...</span>
            <button className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
