"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
      {/* Top Header - Responsive */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/t/${tableId}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#FF6B2C] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Back to Menu</span>
          </Link>
          <h1 className="font-black text-base sm:text-lg text-[#121212]">Confirm Your Order</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Review Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Order Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
              <Link
                href={`/t/${tableId}`}
                className="text-xs font-bold text-[#FF6B2C] hover:underline"
              >
                + Add more items
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="space-y-4 divide-y divide-zinc-100">
                {cart.map((ci) => {
                  const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
                  const lineTotal = unitPrice * ci.quantity;

                  return (
                    <div key={ci.id} className="pt-4 first:pt-0 flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                        {ci.item.imageUrl ? (
                          <Image
                            src={ci.item.imageUrl}
                            alt={ci.item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍴
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#121212]">
                            {ci.item.name}{" "}
                            <span className="text-[#FF6B2C] font-bold">x{ci.quantity}</span>
                          </h3>
                          <span className="font-black text-sm sm:text-base text-[#121212]">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>

                        {ci.selectedVariant && (
                          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                            {ci.selectedVariant.label}
                          </p>
                        )}

                        {ci.note && (
                          <p className="text-xs bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl italic border border-amber-200/60 mt-2">
                            Note: &quot;{ci.note}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Table Info & Payment Summary */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            {/* Table & Venue Info */}
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-3xl border border-zinc-200 flex-shrink-0">
                🪑
              </div>
              <div>
                <h3 className="font-black text-lg text-[#121212]">
                  {tableLabel}
                </h3>
                <p className="text-xs font-semibold text-zinc-400">
                  The Cozy Cafe &bull; Order sent directly to Kitchen Line
                </p>
              </div>
            </div>

            {/* Pricing Summary Box */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Payment Breakdown
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-zinc-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (5%)</span>
                  <span className="font-bold text-zinc-800">{formatPrice(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-[#121212] pt-3 border-t border-zinc-100">
                  <span>Total</span>
                  <span className="text-[#FF6B2C]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleConfirmAndPlace}
                  className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Confirm & Place Order</span>
                  <span>→</span>
                </button>

                <Link
                  href={`/t/${tableId}`}
                  className="w-full py-3 rounded-full text-zinc-500 hover:text-zinc-800 font-bold text-xs text-center flex items-center justify-center transition-colors"
                >
                  ← Back to Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
