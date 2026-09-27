"use client";

import React from "react";
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
    placeOrder,
  } = useCart();

  if (!isOpen) return null;

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    const newOrder = placeOrder();
    onClose();
    router.push(`/orders/success?orderId=${newOrder.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#FAF7F2] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#121212]">Your Cart</h2>
            <span className="text-xs bg-[#FF6B2C]/10 text-[#FF6B2C] font-bold px-2.5 py-1 rounded-full">
              {tableLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-zinc-500 py-12">
              <span className="text-5xl">🛒</span>
              <p className="font-semibold text-lg text-zinc-700">Your cart is empty</p>
              <p className="text-xs max-w-xs">Add delicious dishes from the menu to get started.</p>
            </div>
          ) : (
            cart.map((ci) => {
              const unitPrice = ci.selectedVariant ? ci.selectedVariant.price : ci.item.price;
              const itemTotal = unitPrice * ci.quantity;

              return (
                <div
                  key={ci.id}
                  className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                      {ci.item.imageUrl ? (
                        <Image
                          src={ci.item.imageUrl}
                          alt={ci.item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#121212] truncate">
                        {ci.item.name}
                      </h4>
                      {ci.selectedVariant && (
                        <p className="text-xs text-zinc-500">
                          {ci.selectedVariant.label}
                        </p>
                      )}
                      <p className="text-xs font-bold text-[#FF6B2C] mt-0.5">
                        {formatPrice(unitPrice)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(ci.id)}
                      className="text-zinc-400 hover:text-red-500 text-sm p-1"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>

                  {ci.note && (
                    <p className="text-xs bg-amber-50 text-amber-800 p-2 rounded-lg italic border border-amber-200/50">
                      Note: &quot;{ci.note}&quot;
                    </p>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(ci.id, -1)}
                        className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm px-1">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center hover:bg-[#E55A1F]"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-extrabold text-sm text-[#121212]">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Order Button */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-zinc-200 space-y-4 shadow-lg">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (5%)</span>
                <span className="font-semibold text-zinc-800">{formatPrice(serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#121212] pt-2 border-t border-zinc-100">
                <span>Total</span>
                <span className="text-[#FF6B2C]">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-base transition-all shadow-lg shadow-[#FF6B2C]/30 flex items-center justify-center gap-2"
            >
              <span>Place Order</span>
              <span>• {formatPrice(total)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
