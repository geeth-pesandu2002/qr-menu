"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { useKitchen } from "@/src/context/KitchenContext";
import { ThemeToggle } from "@/src/context/ThemeContext";
import { formatPrice } from "@/src/lib/types";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { cart, tableId, tableLabel, subtotal, serviceCharge, total, placeOrder } = useCart();
  const { addKitchenOrder } = useKitchen();
  const [isPlacing, setIsPlacing] = React.useState(false);

  const handleConfirmAndPlace = async () => {
    if (cart.length === 0 || isPlacing) {
      if (cart.length === 0) router.push(`/t/${tableId}`);
      return;
    }

    setIsPlacing(true);
    try {
      const order = await placeOrder();
      addKitchenOrder(order);
      router.push(`/orders/success?orderId=${order.id}`);
    } catch (e) {
      console.error(e);
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col font-sans select-none pb-12 relative overflow-x-hidden transition-colors duration-300">
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
            href={`/t/${tableId}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#FF6B2C] dark:hover:text-[#FF6B2C] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Back to Menu</span>
          </Link>

          <h1 className="font-black text-base sm:text-lg text-[#121212] dark:text-white">
            Confirm Your Order
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Review Items List (Frosted Glass Card) */}
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

            <div className="bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-5 sm:p-6 space-y-4">
              <div className="space-y-4 divide-y divide-zinc-100 dark:divide-white/10">
                {cart.map((ci) => {
                  const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
                  const lineTotal = unitPrice * ci.quantity;

                  return (
                    <div key={ci.id} className="pt-4 first:pt-0 flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
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
                          <h3 className="font-extrabold text-sm sm:text-base text-[#121212] dark:text-white">
                            {ci.item.name}{" "}
                            <span className="text-[#FF6B2C] font-bold">x{ci.quantity}</span>
                          </h3>
                          <span className="font-black text-sm sm:text-base text-[#121212] dark:text-white">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>

                        {ci.selectedVariant && (
                          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                            {ci.selectedVariant.label}
                          </p>
                        )}

                        {ci.note && (
                          <p className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-xl italic border border-amber-200/60 dark:border-amber-400/20 mt-2">
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

          {/* Right Column: Table Info & Payment Summary (Frosted Glass) */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            {/* Table & Venue Info Glass Card */}
            <div className="bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl p-5 rounded-3xl border border-white/80 dark:border-white/15 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-3xl border border-zinc-200 dark:border-white/10 flex-shrink-0">
                🪑
              </div>
              <div>
                <h3 className="font-black text-lg text-[#121212] dark:text-white">
                  {tableLabel}
                </h3>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  The Cozy Cafe &bull; Order sent directly to Kitchen Line
                </p>
              </div>
            </div>

            {/* Pricing Summary Glass Box */}
            <div className="bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl p-6 rounded-3xl border border-white/80 dark:border-white/15 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Payment Breakdown
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-800 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (5%)</span>
                  <span className="font-bold text-zinc-800 dark:text-white">{formatPrice(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-[#121212] dark:text-white pt-3 border-t border-zinc-100 dark:border-white/10">
                  <span>Total</span>
                  <span className="text-[#FF6B2C]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleConfirmAndPlace}
                  disabled={isPlacing}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#E55A1F] hover:from-[#E55A1F] hover:to-[#FF6B2C] text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 hover:shadow-[#FF6B2C]/50 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {isPlacing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/t/${tableId}`}
                  className="w-full py-3 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white font-bold text-xs text-center flex items-center justify-center transition-colors"
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
