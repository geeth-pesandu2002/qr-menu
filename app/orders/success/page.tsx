"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { ThemeToggle } from "@/src/context/ThemeContext";

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
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col justify-center items-center p-5 font-sans select-none relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF6B2C]/20 dark:bg-[#FF6B2C]/25 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#E7A451]/15 dark:bg-[#E7A451]/20 blur-[130px] pointer-events-none" />

      {/* Top Floating Theme Switcher */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      {/* Celebration Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-12 left-10 text-2xl animate-bounce">🎉</span>
        <span className="absolute top-20 right-14 text-xl animate-pulse">✨</span>
        <span className="absolute bottom-28 left-8 text-xl animate-pulse">🎊</span>
        <span className="absolute bottom-20 right-10 text-2xl animate-bounce">🍕</span>
      </div>

      {/* Frosted Glass Celebration Card */}
      <div className="w-full max-w-md sm:max-w-lg bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/80 dark:border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300 relative z-10">
        {/* Large Orange Success Circle with Glowing Drop Shadow */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6B2C] to-[#FF854D] text-white flex items-center justify-center text-3xl font-black shadow-[0_0_35px_rgba(255,107,44,0.6)]">
          ✓
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-white tracking-tight">
            Order Placed!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Your order has been sent to the kitchen line. You can track the preparation status below.
          </p>
        </div>

        {/* Order Details Frosted Glass Box */}
        <div className="w-full bg-white/50 dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-zinc-200/50 dark:border-white/10 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-[#121212] dark:text-white font-extrabold text-sm sm:text-base">
            <span>📋</span>
            <span>Order #{orderId}</span>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 font-bold">
            <span>🪑</span>
            <span>{order?.tableLabel || tableLabel || `Table ${tableId}`}</span>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-400 font-medium text-xs" suppressHydrationWarning>
            <span>🕒</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3 pt-2">
          <Link
            href={`/orders/${orderId}`}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#E55A1F] hover:from-[#E55A1F] hover:to-[#FF6B2C] text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-[#FF6B2C]/30 hover:shadow-[#FF6B2C]/50 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>View Live Order Status</span>
            <span>→</span>
          </Link>

          <Link
            href={`/t/${tableId}`}
            className="w-full py-3 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white font-bold text-xs flex items-center justify-center transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
