"use client";

import React, { use } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/types";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const orderId = resolvedParams.orderId || "1024";
  const { tableLabel, getOrderById } = useCart();

  const order = getOrderById(orderId);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Checkmark Circle */}
        <div className="w-20 h-20 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center text-4xl shadow-xl shadow-[#FF6B2C]/30 animate-bounce">
          ✓
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#121212]">Order Placed!</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            Your order has been sent to the kitchen. You can track the real-time preparation status below.
          </p>
        </div>

        {/* Order Meta Box */}
        <div className="w-full bg-[#FAF7F2] rounded-2xl p-4 border border-zinc-200/80 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
            <span className="font-bold text-zinc-700">Order #{orderId}</span>
            <span className="bg-[#FF6B2C]/10 text-[#FF6B2C] font-extrabold px-2.5 py-0.5 rounded-full">
              {tableLabel}
            </span>
          </div>

          {order && (
            <div className="space-y-1 text-zinc-600 pt-1">
              <p>
                <span className="font-semibold text-zinc-800">Items:</span>{" "}
                {order.lines.map((l) => `${l.name} x${l.qty}`).join(", ")}
              </p>
              <p className="flex justify-between font-bold text-sm text-[#121212] pt-1">
                <span>Total Amount:</span>
                <span className="text-[#FF6B2C]">{formatPrice(order.total)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3 pt-2">
          <Link
            href={`/orders/${orderId}`}
            className="w-full py-3.5 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-sm transition-all shadow-lg shadow-[#FF6B2C]/20 flex items-center justify-center gap-2"
          >
            <span>View Order Status</span>
            <span>→</span>
          </Link>

          <Link
            href="/t/05"
            className="w-full py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm transition-all flex items-center justify-center"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
