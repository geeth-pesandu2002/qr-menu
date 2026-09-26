"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";
import { ThemeToggle } from "@/src/context/ThemeContext";
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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Combine real diner placed orders with sample history orders
  const displayOrders = orders.length > 0
    ? [...orders, ...DEFAULT_HISTORY_ORDERS.filter((h) => !orders.some((o) => o.id === h.id))]
    : DEFAULT_HISTORY_ORDERS;

  const filteredOrders = displayOrders.filter((order) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return order.status === "RECEIVED" || order.status === "PREPARING";
    if (statusFilter === "SERVED") return order.status === "SERVED" || order.status === "COMPLETED";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col font-sans select-none pb-24 md:pb-12 relative overflow-hidden transition-colors">
      {/* Ambient Cafe Photography & Glowing Lights fixed in background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <Image
          src="/welcome-ambient-bg.jpg"
          alt="Cafe Ambience"
          fill
          className="object-cover opacity-20 dark:opacity-30 filter blur-[1px] scale-105 transition-opacity duration-700"
          priority
        />
        <div className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-[#FF6B2C]/25 dark:bg-[#FF6B2C]/30 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E7A451]/20 dark:bg-[#E7A451]/25 blur-[160px]" />
        <div className="absolute inset-0 bg-[#FAF7F2]/75 dark:bg-[#0D0D0D]/85 backdrop-blur-[2px] transition-colors duration-500" />
      </div>

      {/* Top Header - Frosted Glass */}
      <header className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base shadow-sm shadow-[#FF6B2C]/30">
              🍴
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#121212] dark:text-white">
                My Orders
              </h1>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold hidden sm:block">
                View current and past table orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={`/t/${tableId || "05"}`}
              className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Menu</span>
              <span className="sm:hidden">Menu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-8 flex-1 space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ACTIVE", label: "In Kitchen (Active)" },
            { id: "SERVED", label: "Served & Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25"
                  : "bg-white/80 dark:bg-white/10 backdrop-blur-md text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/15 border border-zinc-200/80 dark:border-white/15"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Responsive Grid of Order Cards: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredOrders.map((order) => {
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
                className="bg-white/80 dark:bg-white/[0.07] backdrop-blur-2xl p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between gap-3 group block active:scale-99"
              >
                {/* Top Row: #1024, Status Badge, > */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-base sm:text-lg text-[#121212] dark:text-white group-hover:text-[#FF6B2C] transition-colors">
                    #{order.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-full transition-colors ${
                        isPreparing
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30"
                          : isServed
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400 border border-zinc-200 dark:border-white/10"
                      }`}
                    >
                      {isPreparing
                        ? "Preparing"
                        : isServed
                        ? "Served"
                        : "Completed"}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-bold group-hover:translate-x-1 transition-transform text-sm">
                      ›
                    </span>
                  </div>
                </div>

                {/* Table & Items Overview */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span>🪑</span>
                    <span>{order.tableLabel}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {order.lines.map((l) => `${l.name} x${l.qty}`).join(", ")}
                  </p>
                </div>

                {/* Date & Price Row */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-white/10 text-xs">
                  <span className="text-zinc-400 dark:text-zinc-500 font-medium text-[11px]" suppressHydrationWarning>
                    {formattedDate}
                  </span>
                  <span className="font-black text-sm sm:text-base text-[#121212] dark:text-white">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar - Visible on Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-white/10 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center shadow-lg transition-colors">
        <Link
          href={`/t/${tableId || "05"}`}
          className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            📱
          </div>
          <span>Menu</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
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
