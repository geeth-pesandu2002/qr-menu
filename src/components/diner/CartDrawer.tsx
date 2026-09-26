"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const {
    tableLabel,
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    serviceCharge,
    total,
  } = useCart();

  const [orderInstructions, setOrderInstructions] = useState<string>("");

  if (!isOpen) return null;

  const handleProceedToConfirm = () => {
    if (cart.length === 0) return;
    onClose();
    // Navigate to Screen 7: Confirm Order
    router.push("/orders/confirm");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end select-none">
      <div
        className="w-full max-w-md bg-[#FAF7F2] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Screen 6 */}
        <div className="p-4 bg-white border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#121212]">Your Cart</h2>
            <span className="text-[11px] bg-zinc-100 text-zinc-700 font-extrabold px-2.5 py-0.5 rounded-full border border-zinc-200">
              {tableLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-zinc-400 py-16">
              <span className="text-5xl opacity-40">🛒</span>
              <p className="font-extrabold text-base text-[#121212]">Your cart is empty</p>
              <p className="text-xs max-w-xs text-zinc-400">
                Select some delicious dishes from the menu to get started.
              </p>
            </div>
          ) : (
            cart.map((ci) => {
              const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
              const itemTotal = unitPrice * ci.quantity;

              return (
                <div
                  key={ci.id}
                  className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Item Thumbnail */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                      {ci.item.imageUrl ? (
                        <Image
                          src={ci.item.imageUrl}
                          alt={ci.item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🍴
                        </div>
                      )}
                    </div>

                    {/* Title & Unit Price */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-[#121212] truncate">
                        {ci.item.name}
                      </h4>
                      {ci.selectedVariant && (
                        <p className="text-[11px] text-zinc-400 font-semibold">
                          {ci.selectedVariant.label}
                        </p>
                      )}
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">
                        {formatPrice(unitPrice)}
                      </p>
                    </div>

                    {/* Trash Button */}
                    <button
                      onClick={() => removeFromCart(ci.id)}
                      className="text-zinc-400 hover:text-red-500 text-sm p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>

                  {ci.note && (
                    <p className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-xl italic border border-amber-200/60">
                      Note: &quot;{ci.note}&quot;
                    </p>
                  )}

                  {/* Quantity Stepper & Line Total */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                    <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                      <button
                        onClick={() => updateQuantity(ci.id, -1)}
                        className="w-6 h-6 rounded-full bg-white text-zinc-800 font-bold flex items-center justify-center text-xs hover:bg-zinc-200 transition-colors shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-xs text-[#121212]">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(ci.id, 1)}
                        className="w-6 h-6 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center text-xs hover:bg-[#E55A1F] transition-colors shadow-2xs"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-black text-sm text-[#121212]">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Special Instructions (Optional) Box */}
          {cart.length > 0 && (
            <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs space-y-1.5 mt-2">
              <label className="text-xs font-bold text-zinc-700 block">
                Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please bring cutlery, extra sauce, etc."
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {/* Footer Summary & Place Order Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-zinc-200/80 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-zinc-500">
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

            <button
              onClick={handleProceedToConfirm}
              className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Place Order</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
