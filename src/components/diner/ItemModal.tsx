"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem, Variant, formatPrice } from "@/src/lib/types";

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, variant?: Variant, note?: string) => void;
}

export default function ItemModal({ item, onClose, onAddToCart }: ItemModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Reset state when a new item opens
  React.useEffect(() => {
    if (item) {
      setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : undefined);
      setQuantity(1);
      setNote("");
      setIsLiked(false);
    }
  }, [item]);

  if (!item) return null;

  const unitPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedVariant, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div
        className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200 border border-white/80 dark:border-white/10 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar: Back arrow, Title, Heart */}
        <div className="px-5 py-3.5 border-b border-zinc-200/60 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10 transition-colors">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-bold transition-colors"
          >
            ←
          </button>
          <h2 className="font-extrabold text-sm text-[#121212] dark:text-white truncate max-w-[200px]">
            {item.name}
          </h2>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors ${
              isLiked ? "text-red-500 bg-red-50 dark:bg-red-950/40" : "text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-white/10"
            }`}
          >
            {isLiked ? "♥" : "♡"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5">
          {/* Large Hero Image */}
          <div className="relative w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-800">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🍴
              </div>
            )}
          </div>

          <div className="px-5 space-y-5">
            {/* Title, Price, Description */}
            <div className="space-y-1">
              <h1 className="text-xl font-black text-[#121212] dark:text-white">{item.name}</h1>
              <p className="text-base font-extrabold text-[#FF6B2C]">
                {formatPrice(unitPrice)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1">
                {item.description}
              </p>
            </div>

            {/* Variant Selector (if item has sizes / variants) */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-2 border-t border-zinc-200/60 dark:border-white/10 pt-4">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Select Size / Variant
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {item.variants.map((v) => {
                    const isSelected = selectedVariant?.label === v.label;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 transition-all ${
                          isSelected
                            ? "border-[#FF6B2C] bg-[#FF6B2C]/10 text-[#FF6B2C] font-bold shadow-2xs"
                            : "border-zinc-200/80 dark:border-white/15 bg-white/50 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/30"
                        }`}
                      >
                        <span className="text-xs font-bold">{v.label}</span>
                        <span className="text-xs font-black">{formatPrice(v.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-white/10 pt-4">
              <span className="text-xs font-extrabold text-[#121212] dark:text-white uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/10 rounded-full p-1 border border-zinc-200/80 dark:border-white/15">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white font-bold flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-2xs text-sm"
                >
                  -
                </button>
                <span className="w-6 text-center font-extrabold text-sm text-[#121212] dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center hover:bg-[#E55A1F] transition-colors shadow-2xs text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Special Instructions (Optional) */}
            <div className="space-y-1.5 border-t border-zinc-200/60 dark:border-white/10 pt-4 pb-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. No onions, extra cheese, etc."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white/70 dark:bg-white/5 border border-zinc-200 dark:border-white/15 rounded-2xl px-4 py-3 text-xs text-[#121212] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF6B2C] focus:bg-white dark:focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Button: Add to Cart */}
        <div className="p-4 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-t border-zinc-200/60 dark:border-white/10 transition-colors">
          <button
            onClick={handleAdd}
            className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Add to Cart</span>
            <span>–</span>
            <span>{formatPrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
