"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { useKitchen } from "@/src/context/KitchenContext";

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

  const isReceived = true; // Once placed, it's always received
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
      {/* Top Header - Screen 9 */}
      <header className="bg-white border-b border-zinc-200/80 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href={`/t/${tableId || "05"}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-[#FF6B2C] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Back</span>
          </Link>
          <h1 className="font-black text-base text-[#121212]">Order Status</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-5 space-y-4 flex-1">
        {/* Order Info Card */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h2 className="font-black text-base text-[#121212]">Order #{orderId}</h2>
            </div>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
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
                ? "Preparing"
                : "Received"}
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-semibold space-y-1 pt-1">
            <p className="flex items-center gap-2">
              <span>🪑</span>
              <span>{displayTable}</span>
            </p>
            <p className="flex items-center gap-2 text-zinc-400 text-[11px]" suppressHydrationWarning>
              <span>🕒</span>
              <span>{formattedDateStr}</span>
            </p>
          </div>
        </div>

        {/* Vertical Timeline Stepper - Screen 9 */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200">
            {/* Step 1: Order Received */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-8 w-7 h-7 rounded-full bg-[#FF6B2C] text-white text-xs font-black flex items-center justify-center shadow-md shadow-[#FF6B2C]/25">
                ✓
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#121212]">Order Received</h3>
                  <span className="text-[11px] text-zinc-400 font-semibold" suppressHydrationWarning>
                    {orderTimeStr}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your order has been received by the restaurant.
                </p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="relative flex items-start gap-4">
              <div
                className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-all ${
                  isPreparing
                    ? "bg-[#FF6B2C] text-white ring-4 ring-[#FF6B2C]/20 shadow-[#FF6B2C]/25"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                {isServed ? "✓" : "🍳"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className={`font-extrabold text-sm ${isPreparing ? "text-[#121212]" : "text-zinc-400"}`}>
                    Preparing
                  </h3>
                  {isPreparing && !isServed && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B2C] animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your food is being prepared in the kitchen.
                </p>
              </div>
            </div>

            {/* Step 3: Served */}
            <div className={`relative flex items-start gap-4 ${isServed ? "" : "opacity-45"}`}>
              <div
                className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isServed
                    ? "bg-[#06402B] text-white shadow-md shadow-emerald-900/20"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                {isServed ? "✓" : "🍽️"}
              </div>
              <div className="space-y-0.5">
                <h3 className={`font-extrabold text-sm ${isServed ? "text-[#121212]" : "text-zinc-400"}`}>
                  Served
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  We&apos;ll notify you when it&apos;s ready to be served.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Time Card - Screen 9 */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold border border-amber-200">
            🕒
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Estimated Time
            </span>
            <span className="text-sm font-black text-[#121212]">
              ~ 15 minutes
            </span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href={`/t/${tableId || "05"}`}
            className="w-full py-4 rounded-full bg-white hover:bg-zinc-100 text-[#121212] font-black text-xs border border-zinc-200 shadow-xs flex items-center justify-center transition-all"
          >
            Order More Dishes
          </Link>
        </div>
      </main>
    </div>
  );
}
