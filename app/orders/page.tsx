"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/types";
import CartDrawer from "@/src/components/diner/CartDrawer";

const DEFAULT_HISTORY_ORDERS = [
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
    total: 2700,
    dateStr: "12 Jul 2024, 1:25 PM",
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
      { itemId: "d1", name: "Coke", variantLabel: null, unitPrice: 300, qty: 1, note: "" },
    ],
    subtotal: 1800,
    serviceCharge: 90,
    total: 1800,
    dateStr: "11 Jul 2024, 6:45 PM",
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
      { itemId: "sw1", name: "Chocolate Cake", variantLabel: null, unitPrice: 750, qty: 1, note: "" },
    ],
    subtotal: 2100,
    serviceCharge: 105,
    total: 2100,
    dateStr: "10 Jul 2024, 1:15 PM",
    createdAt: 1720607200000,
    updatedAt: 1720607200000,
  },
];

export default function OrderHistoryPage() {
  const { orders, tableId, itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Combine real diner placed orders with sample history orders
  const displayOrders = orders.length > 0 ? [...orders, ...DEFAULT_HISTORY_ORDERS.filter((h) => !orders.some((o) => o.id === h.id))] : DEFAULT_HISTORY_ORDERS;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans select-none pb-24">
      {/* Top Header - Screen 10 */}
      <header className="bg-white border-b border-zinc-200/80 px-5 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base shadow-sm shadow-[#FF6B2C]/30">
            🍴
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#121212]">
            My Orders
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-5 space-y-3.5 flex-1">
        {displayOrders.map((order) => {
          const isPreparing = order.status === "PREPARING" || order.status === "RECEIVED";
          const isServed = order.status === "SERVED";
          const isCompleted = order.status === "COMPLETED";

          const formattedDate = (order as unknown as { dateStr?: string }).dateStr
            ? (order as unknown as { dateStr?: string }).dateStr
            : new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }) +
              ", " +
              new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col gap-2 group block active:scale-99"
            >
              {/* Top Row: #1024, Status Badge, > */}
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
                  #{order.id}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                      isPreparing
                        ? "bg-amber-100 text-amber-800"
                        : isServed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {isPreparing
                      ? "Preparing"
                      : isServed
                      ? "Served"
                      : "Completed"}
                  </span>
                  <span className="text-zinc-400 font-bold group-hover:translate-x-0.5 transition-transform text-sm">
                    ›
                  </span>
                </div>
              </div>

              {/* Second Row: Table */}
              <div className="text-xs font-semibold text-zinc-400">
                {order.tableLabel}
              </div>

              {/* Third Row: Date & Price */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-xs">
                <span className="text-zinc-400 font-medium" suppressHydrationWarning>
                  {formattedDate}
                </span>
                <span className="font-black text-sm text-[#121212]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Link>
          );
        })}
      </main>

      {/* Fixed Bottom Navigation Bar - Screen 10 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center shadow-lg">
        <Link
          href={`/t/${tableId || "05"}`}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            📱
          </div>
          <span>Menu</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            🛒
          </div>
          <span>Cart</span>
          {itemCount > 0 && (
            <span
              className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#FF6B2C] text-white text-[9px] font-black flex items-center justify-center"
              suppressHydrationWarning
            >
              {itemCount}
            </span>
          )}
        </button>

        <div className="flex flex-col items-center gap-1 text-[#FF6B2C] font-extrabold text-[11px]">
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            👤
          </div>
          <span>My Order</span>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
