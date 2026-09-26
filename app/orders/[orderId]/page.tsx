"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";
import { useKitchen } from "@/src/context/KitchenContext";
import { ThemeToggle } from "@/src/context/ThemeContext";
import { formatPrice } from "@/src/lib/types";

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const { getOrderById, tableLabel, tableId } = useCart();
  const { kitchenOrders } = useKitchen();

  // Find order in diner cart orders, or in kitchen orders for live status synchronization
  const cartOrder = getOrderById(orderId);
  const kitchenOrder = kitchenOrders.find((o) => o.id === orderId);

  const status = kitchenOrder ? kitchenOrder.status : cartOrder?.status || "PREPARING";
  const displayTable = kitchenOrder?.tableLabel || cartOrder?.tableLabel || tableLabel || `Table ${tableId}`;

  const isReceived = true;
  const isPreparing = status === "PREPARING" || status === "SERVED" || status === "COMPLETED";
  const isServed = status === "SERVED" || status === "COMPLETED";

  const orderTimeStr = cartOrder
    ? new Date(cartOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "1:25 PM";

  const formattedDateStr = cartOrder
    ? new Date(cartOrder.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${orderTimeStr}`
    : "12 Jul 2024, 1:25 PM";

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col font-sans select-none pb-12 relative overflow-hidden transition-colors">
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
          <Link
            href={`/t/${tableId || "05"}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#FF6B2C] dark:hover:text-[#FF6B2C] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Back to Menu</span>
          </Link>
          <h1 className="font-black text-base sm:text-lg text-[#121212] dark:text-white">
            Live Order Status
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/orders"
              className="text-xs font-extrabold text-[#FF6B2C] hover:underline hidden sm:inline-block"
            >
              All Orders →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Status Overview & Live Stepper */}
          <div className="lg:col-span-7 space-y-5">
            {/* Order Info Banner - Frosted Glass Card */}
            <div className="bg-white/80 dark:bg-white/[0.07] backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 flex flex-wrap items-center justify-between gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <h2 className="font-black text-lg sm:text-xl text-[#121212] dark:text-white">Order #{orderId}</h2>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 font-semibold flex items-center gap-2" suppressHydrationWarning>
                  <span>🪑 {displayTable}</span>
                  <span>&bull;</span>
                  <span>{formattedDateStr}</span>
                </p>
              </div>

              <span
                className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full transition-colors ${
                  status === "COMPLETED" || status === "SERVED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
                    : status === "PREPARING"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/30"
                }`}
              >
                {status === "COMPLETED"
                  ? "Served"
                  : status === "SERVED"
                  ? "Ready to Serve"
                  : status === "PREPARING"
                  ? "Preparing in Kitchen"
                  : "Received"}
              </span>
            </div>

            {/* Live Stepper Timeline Card - Frosted Glass Card */}
            <div className="bg-white/80 dark:bg-white/[0.07] backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 space-y-6 transition-colors">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                Preparation Progress Timeline
              </h3>

              <div className="relative pl-8 sm:pl-10 space-y-8 sm:space-y-10 before:absolute before:left-3.5 sm:before:left-4.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/15">
                {/* Step 1: Order Received */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-8 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FF6B2C] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-md shadow-[#FF6B2C]/25">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#121212] dark:text-white">Order Received</h4>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold" suppressHydrationWarning>
                        {orderTimeStr}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Your order has been logged and sent to the kitchen display board.
                    </p>
                  </div>
                </div>

                {/* Step 2: Preparing */}
                <div className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-8 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-md transition-all ${
                      isPreparing
                        ? "bg-[#FF6B2C] text-white ring-4 ring-[#FF6B2C]/20 shadow-[#FF6B2C]/25"
                        : "bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {isServed ? "✓" : "🍳"}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-extrabold text-sm sm:text-base ${isPreparing ? "text-[#121212] dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>
                        Preparing
                      </h4>
                      {isPreparing && !isServed && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Chefs are currently preparing your dishes fresh to order.
                    </p>
                  </div>
                </div>

                {/* Step 3: Served */}
                <div className={`relative flex items-start gap-4 ${isServed ? "" : "opacity-45"}`}>
                  <div
                    className={`absolute -left-8 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all ${
                      isServed
                        ? "bg-[#06402B] dark:bg-[#198754] text-white shadow-md shadow-emerald-900/20"
                        : "bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {isServed ? "✓" : "🍽️"}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`font-extrabold text-sm sm:text-base ${isServed ? "text-[#121212] dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>
                      Served to Table
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Your dishes are plated and served hot at {displayTable}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Time Card - Frosted Glass */}
            <div className="bg-white/80 dark:bg-white/[0.07] backdrop-blur-2xl p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-500/30 flex-shrink-0">
                🕒
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider block">
                  Estimated Preparation Time
                </span>
                <span className="text-base sm:text-lg font-black text-[#121212] dark:text-white">
                  ~ 15 minutes
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary & Action Links */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            {cartOrder && (
              <div className="bg-white/80 dark:bg-white/[0.07] backdrop-blur-2xl p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30 space-y-4 transition-colors">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Ordered Dishes ({cartOrder.lines.reduce((s, l) => s + l.qty, 0)})
                </h3>

                <div className="space-y-3 divide-y divide-zinc-200/50 dark:divide-white/10">
                  {cartOrder.lines.map((line, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex justify-between items-start text-xs sm:text-sm">
                      <div>
                        <p className="font-extrabold text-[#121212] dark:text-white">
                          {line.name} <span className="text-zinc-400 dark:text-zinc-500 font-bold">x{line.qty}</span>
                        </p>
                        {line.variantLabel && (
                          <p className="text-zinc-400 dark:text-zinc-400 text-xs">{line.variantLabel}</p>
                        )}
                        {line.note && (
                          <p className="text-amber-700 dark:text-amber-300 italic text-[11px] mt-0.5">
                            Note: &quot;{line.note}&quot;
                          </p>
                        )}
                      </div>
                      <span className="font-black text-[#121212] dark:text-white">
                        {formatPrice(line.unitPrice * line.qty)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 flex justify-between font-black text-base text-[#121212] dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-[#FF6B2C]">{formatPrice(cartOrder.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/t/${tableId || "05"}`}
                className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Order More Dishes</span>
                <span>+</span>
              </Link>

              <Link
                href="/orders"
                className="w-full py-3.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-[#121212] dark:text-white font-bold text-xs border border-zinc-200 dark:border-white/15 shadow-xs flex items-center justify-center transition-all backdrop-blur-md"
              >
                View All My Past Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
