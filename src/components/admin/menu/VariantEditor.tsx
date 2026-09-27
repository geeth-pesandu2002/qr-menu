"use client";

import React from "react";
import { Variant, formatPrice } from "@/src/lib/types";

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export default function VariantEditor({
  variants,
  onChange,
}: VariantEditorProps) {
  const handleAddVariant = () => {
    onChange([...variants, { label: "", price: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    const updated = variants.map((v, i) => {
      if (i === index) {
        return {
          ...v,
          [field]: field === "price" ? Number(value) || 0 : value,
        };
      }
      return v;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-zinc-700 block">
            Item Variants / Portions
          </label>
          <span className="text-[11px] text-zinc-400">
            Define size or portion price differences (e.g. Regular, Large)
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddVariant}
          className="px-3 py-1.5 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] hover:bg-[#FF6B2C] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
        >
          <span>➕</span>
          <span>Add Variant</span>
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            No variants configured. The standard base price will apply to this dish.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {variants.map((v, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80"
            >
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Variant label (e.g. Regular, Large)"
                  value={v.label}
                  onChange={(e) =>
                    handleUpdateVariant(index, "label", e.target.value)
                  }
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
                />
              </div>

              <div className="w-36 flex-shrink-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={v.price === 0 ? "" : v.price}
                    onChange={(e) =>
                      handleUpdateVariant(index, "price", e.target.value)
                    }
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-zinc-400 hover:text-rose-600 flex items-center justify-center text-xs transition-colors flex-shrink-0"
                title="Remove variant"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
