"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { useKitchen } from "@/src/context/KitchenContext";
import { formatPrice } from "@/src/lib/types";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { cart, tableId, tableLabel, subtotal, serviceCharge, total, placeOrder } = useCart();
  const { addKitchenOrder } = useKitchen();

  const handleConfirmAndPlace = () => {
    if (cart.length === 0) {
      router.push(`/t/${tableId}`);
      return;
    }

    const order = placeOrder();
    addKitchenOrder(order);
    router.push(`/orders/success?orderId=${order.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans select-none pb-12">
      {/* Top Header - Screen 7 */}
      <header className="bg-white border-b border-zinc-200/80 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href={`/t/${tableId}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-[#FF6B2C]"
          >
            <span className="text-base">←</span>
            <span>Back</span>
          </Link>
          <h1 className="font-black text-base text-[#121212]">Confirm Your Order</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-5 space-y-4 flex-1">
        {/* Table & Venue Card */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl border border-zinc-200">
            🪑
          </div>
          <div>
            <h2 className="font-black text-base text-[#121212]">
              {tableLabel}
            </h2>
            <p className="text-xs font-semibold text-zinc-400">
              The Cozy Cafe
            </p>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Order Summary ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
          </h3>

          <div className="space-y-3 divide-y divide-zinc-100">
            {cart.map((ci) => {
              const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
              const lineTotal = unitPrice * ci.quantity;

              return (
                <div key={ci.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm text-[#121212]">
                      {ci.item.name} <span className="text-zinc-500 font-bold">x{ci.quantity}</span>
                    </h4>
                    {ci.selectedVariant && (
                      <p className="text-[11px] text-zinc-400 font-medium">
                        {ci.selectedVariant.label}
                      </p>
                    )}
                    {ci.note && (
                      <p className="text-[11px] text-amber-800 font-medium italic">
                        {ci.note}
                      </p>
                    )}
                  </div>

                  <span className="font-extrabold text-sm text-[#121212]">
                    {formatPrice(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-zinc-100 pt-3 space-y-1.5 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge (5%)</span>
              <span className="font-bold text-zinc-800">{formatPrice(serviceCharge)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#121212] pt-2 border-t border-zinc-100">
              <span>Total</span>
              <span className="text-[#FF6B2C]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleConfirmAndPlace}
            className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Confirm & Place Order</span>
          </button>

          <Link
            href={`/t/${tableId}`}
            className="w-full py-3 rounded-full text-zinc-500 hover:text-zinc-800 font-bold text-xs text-center flex items-center justify-center transition-colors"
          >
            ← Back to Menu
          </Link>
        </div>
      </main>
    </div>
  );
}
