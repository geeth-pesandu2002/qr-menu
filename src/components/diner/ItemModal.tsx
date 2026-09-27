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
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");

  if (!item) return null;

  const unitPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedVariant, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Close Button */}
        <div className="relative w-full h-56 bg-zinc-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50">
              🍽️
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-lg backdrop-blur-md transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-[#121212]">{item.name}</h2>
              <span className="text-xl font-extrabold text-[#FF6B2C]">
                {formatPrice(unitPrice)}
              </span>
            </div>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Variant Selection if available */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-3 border-t border-zinc-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Choose Size / Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                {item.variants.map((v) => {
                  const isSelected = selectedVariant?.label === v.label;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        isSelected
                          ? "border-[#FF6B2C] bg-[#FF6B2C]/5 text-[#FF6B2C] font-semibold"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-sm">{v.label}</span>
                      <span className="text-xs font-bold">{formatPrice(v.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-sm font-bold text-[#121212]">Quantity</span>
            <div className="flex items-center gap-3 bg-zinc-100 rounded-full p-1 border border-zinc-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-white text-zinc-800 font-bold flex items-center justify-center hover:bg-zinc-200 transition-all shadow-sm"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-[#121212]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center hover:bg-[#E55A1F] transition-all shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. No onions, extra sauce, less spicy..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-white border-t border-zinc-100">
          <button
            onClick={handleAdd}
            className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-base transition-all shadow-lg shadow-[#FF6B2C]/30 flex items-center justify-between px-6"
          >
            <span>Add to Cart</span>
            <span>{formatPrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
