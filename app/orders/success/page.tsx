"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const orderId = resolvedParams.orderId || "1024";
  const { tableId, tableLabel, getOrderById } = useCart();

  const order = getOrderById(orderId);

  const formattedDate = order
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "12 Jul 2024, 1:25 PM";

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col justify-center items-center p-5 font-sans select-none relative overflow-hidden">
      {/* Decorative Celebration Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-12 left-10 text-2xl animate-bounce">🎉</span>
        <span className="absolute top-20 right-12 text-xl animate-pulse">✨</span>
        <span className="absolute bottom-28 left-8 text-xl animate-pulse">🎊</span>
        <span className="absolute bottom-20 right-10 text-2xl animate-bounce">🍕</span>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#FF6B2C] opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#E7A451] opacity-60" />
        <div className="absolute bottom-1/3 left-1/5 w-2.5 h-2.5 rounded-full bg-[#06402B] opacity-40" />
      </div>

      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-7 sm:p-10 border border-zinc-200/90 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300 relative z-10">
        {/* Large Orange Success Circle with Checkmark */}
        <div className="w-20 h-20 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-[#FF6B2C]/35">
          ✓
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#121212] tracking-tight">
            Order Placed!
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Your order has been sent to the kitchen. You can track the status below.
          </p>
        </div>

        {/* Order Details Box */}
        <div className="w-full bg-[#FAF7F2] rounded-2xl p-4 border border-zinc-200/80 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-700 font-extrabold text-sm">
            <span>📋</span>
            <span>Order #{orderId}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 font-bold">
            <span>🪑</span>
            <span>{order?.tableLabel || tableLabel || `Table ${tableId}`}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 font-medium text-[11px]" suppressHydrationWarning>
            <span>🕒</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-2.5 pt-2">
          <Link
            href={`/orders/${orderId}`}
            className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>View Order Status</span>
          </Link>

          <Link
            href={`/t/${tableId}`}
            className="w-full py-3 rounded-full text-zinc-500 hover:text-zinc-800 font-bold text-xs flex items-center justify-center transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
