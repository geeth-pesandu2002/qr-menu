"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/types";

const FALLBACK_ORDERS = [
  {
    id: "1024",
    tableId: "05",
    tableLabel: "Table 05",
    sessionId: "s1",
    status: "PREPARING" as const,
    lines: [
      { itemId: "b1", name: "Chicken Burger", variantLabel: null, unitPrice: 1200, qty: 2, note: "" },
      { itemId: "d1", name: "Coke", variantLabel: null, unitPrice: 300, qty: 1, note: "" },
    ],
    subtotal: 2700,
    serviceCharge: 135,
    total: 2835,
    createdAt: 1720780000000,
    updatedAt: 1720780000000,
  },
  {
    id: "1023",
    tableId: "05",
    tableLabel: "Table 05",
    sessionId: "s2",
    status: "SERVED" as const,
    lines: [
      { itemId: "p1", name: "Margherita Pizza", variantLabel: null, unitPrice: 1500, qty: 1, note: "" },
    ],
    subtotal: 1500,
    serviceCharge: 75,
    total: 1575,
    createdAt: 1720693600000,
    updatedAt: 1720693600000,
  },
  {
    id: "1022",
    tableId: "03",
    tableLabel: "Table 03",
    sessionId: "s3",
    status: "COMPLETED" as const,
    lines: [
      { itemId: "b2", name: "Beef Burger", variantLabel: null, unitPrice: 1350, qty: 1, note: "" },
      { itemId: "d1", name: "Iced Latte", variantLabel: null, unitPrice: 600, qty: 1, note: "" },
    ],
    subtotal: 1950,
    serviceCharge: 97,
    total: 2047,
    createdAt: 1720607200000,
    updatedAt: 1720607200000,
  },
];

export default function OrderHistoryPage() {
  const { orders } = useCart();
  const displayOrders = orders.length > 0 ? orders : FALLBACK_ORDERS;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans pb-12">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <Link
          href="/t/05"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-[#FF6B2C]"
        >
          <span>←</span>
          <span>Back to Menu</span>
        </Link>
        <span className="font-extrabold text-base text-[#121212]">My Orders</span>
        <div className="w-12" />
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-6 space-y-4">
        <h1 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
          Recent Orders
        </h1>

        <div className="space-y-3">
          {displayOrders.map((order) => {
            const isPreparing = order.status === "PREPARING" || order.status === "RECEIVED";
            const isServed = order.status === "SERVED";

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
                      #{order.id}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">•</span>
                    <span className="text-xs font-bold text-zinc-600">
                      {order.tableLabel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    {order.lines.map((l) => `${l.name} x${l.qty}`).join(", ")}
                  </p>

                  <p className="text-xs font-bold text-[#FF6B2C]">
                    {formatPrice(order.total)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      isPreparing
                        ? "bg-amber-100 text-amber-800"
                        : isServed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
