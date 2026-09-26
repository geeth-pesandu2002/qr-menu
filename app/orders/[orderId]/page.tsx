"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { useKitchen } from "@/src/context/KitchenContext";
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans select-none pb-12">
      {/* Top Header - Responsive */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/t/${tableId || "05"}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#FF6B2C] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Back to Menu</span>
          </Link>
          <h1 className="font-black text-base sm:text-lg text-[#121212]">Live Order Status</h1>
          <Link
            href="/orders"
            className="text-xs font-extrabold text-[#FF6B2C] hover:underline"
          >
            All Orders →
          </Link>
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Status Overview & Live Stepper */}
          <div className="lg:col-span-7 space-y-5">
            {/* Order Info Banner */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <h2 className="font-black text-lg sm:text-xl text-[#121212]">Order #{orderId}</h2>
                </div>
                <p className="text-xs text-zinc-400 font-semibold flex items-center gap-2" suppressHydrationWarning>
                  <span>🪑 {displayTable}</span>
                  <span>&bull;</span>
                  <span>{formattedDateStr}</span>
                </p>
              </div>

              <span
                className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full ${
                  status === "COMPLETED" || status === "SERVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "PREPARING"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-orange-100 text-orange-800"
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

            {/* Live Stepper Timeline Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Preparation Progress Timeline
              </h3>

              <div className="relative pl-8 sm:pl-10 space-y-8 sm:space-y-10 before:absolute before:left-3.5 sm:before:left-4.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200">
                {/* Step 1: Order Received */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-8 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FF6B2C] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-md shadow-[#FF6B2C]/25">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#121212]">Order Received</h4>
                      <span className="text-[11px] text-zinc-400 font-semibold" suppressHydrationWarning>
                        {orderTimeStr}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
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
                        : "bg-zinc-200 text-zinc-400"
                    }`}
                  >
                    {isServed ? "✓" : "🍳"}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-extrabold text-sm sm:text-base ${isPreparing ? "text-[#121212]" : "text-zinc-400"}`}>
                        Preparing
                      </h4>
                      {isPreparing && !isServed && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Chefs are currently preparing your dishes fresh to order.
                    </p>
                  </div>
                </div>

                {/* Step 3: Served */}
                <div className={`relative flex items-start gap-4 ${isServed ? "" : "opacity-45"}`}>
                  <div
                    className={`absolute -left-8 sm:-left-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all ${
                      isServed
                        ? "bg-[#06402B] text-white shadow-md shadow-emerald-900/20"
                        : "bg-zinc-200 text-zinc-400"
                    }`}
                  >
                    {isServed ? "✓" : "🍽️"}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`font-extrabold text-sm sm:text-base ${isServed ? "text-[#121212]" : "text-zinc-400"}`}>
                      Served to Table
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Your dishes are plated and served hot at {displayTable}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Time Card */}
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold border border-amber-200 flex-shrink-0">
                🕒
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Estimated Preparation Time
                </span>
                <span className="text-base sm:text-lg font-black text-[#121212]">
                  ~ 15 minutes
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary & Action Links */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            {cartOrder && (
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Ordered Dishes ({cartOrder.lines.reduce((s, l) => s + l.qty, 0)})
                </h3>

                <div className="space-y-3 divide-y divide-zinc-100">
                  {cartOrder.lines.map((line, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex justify-between items-start text-xs sm:text-sm">
                      <div>
                        <p className="font-extrabold text-[#121212]">
                          {line.name} <span className="text-zinc-400 font-bold">x{line.qty}</span>
                        </p>
                        {line.variantLabel && (
                          <p className="text-zinc-400 text-xs">{line.variantLabel}</p>
                        )}
                        {line.note && (
                          <p className="text-amber-800 italic text-[11px] mt-0.5">
                            Note: &quot;{line.note}&quot;
                          </p>
                        )}
                      </div>
                      <span className="font-black text-[#121212]">
                        {formatPrice(line.unitPrice * line.qty)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 flex justify-between font-black text-base text-[#121212]">
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
                className="w-full py-3.5 rounded-full bg-white hover:bg-zinc-100 text-[#121212] font-bold text-xs border border-zinc-200 shadow-xs flex items-center justify-center transition-all"
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
