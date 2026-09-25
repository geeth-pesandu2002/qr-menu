"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/types";

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const { getOrderById, tableLabel } = useCart();

  const order = getOrderById(orderId);

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
        <span className="font-extrabold text-base text-[#121212]">Order Status</span>
        <span className="text-xs bg-[#FF6B2C]/10 text-[#FF6B2C] font-bold px-2.5 py-1 rounded-full">
          {order?.tableLabel || tableLabel}
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-6 space-y-6">
        {/* Order Header Card */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#121212]">Order #{orderId}</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5" suppressHydrationWarning>
              Placed at {order ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "1:25 PM"}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Est. Time</span>
            <span className="text-sm font-extrabold text-amber-900">~15 mins</span>
          </div>
        </div>

        {/* Live Stepper Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Live Preparation Progress
          </h2>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
            {/* Step 1: Received */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#06402B] text-white text-xs font-bold flex items-center justify-center shadow-md">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#121212]">Order Received</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Your order has been received by the restaurant.
                </p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#E7A451] text-white text-xs font-bold flex items-center justify-center animate-ping" />
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#E7A451] text-white text-xs font-bold flex items-center justify-center shadow-md">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#121212]">Preparing</h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Your food is currently being prepared in the kitchen.
                </p>
              </div>
            </div>

            {/* Step 3: Served */}
            <div className="relative flex items-start gap-4 opacity-50">
              <div className="absolute -left-6 w-5 h-5 rounded-full bg-zinc-300 text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#121212]">Served</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  We&apos;ll notify you when it&apos;s ready to be served.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Breakdown */}
        {order && (
          <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Order Summary
            </h3>

            <div className="space-y-3 divide-y divide-zinc-100">
              {order.lines.map((line, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-sm text-[#121212]">
                      {line.qty}x {line.name}
                    </p>
                    {line.variantLabel && (
                      <p className="text-zinc-500">{line.variantLabel}</p>
                    )}
                    {line.note && (
                      <p className="text-amber-700 italic mt-0.5">Note: &quot;{line.note}&quot;</p>
                    )}
                  </div>
                  <span className="font-bold text-sm text-[#121212]">
                    {formatPrice(line.unitPrice * line.qty)}
                  </span>
                </div>
              ))}

              <div className="pt-3 flex justify-between font-extrabold text-sm text-[#121212]">
                <span>Total Paid</span>
                <span className="text-[#FF6B2C]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
