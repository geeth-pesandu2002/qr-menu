"use client";

import React, { useState } from "react";
import { MenuItem, Category, Variant } from "@/src/lib/types";
import VariantEditor from "./VariantEditor";

interface MenuItemFormProps {
  initialData?: Partial<MenuItem>;
  categories: Category[];
  onSubmit: (data: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const SAMPLE_IMAGES = [
  { label: "Chicken Dish", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" },
  { label: "Smash Burger", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80" },
  { label: "Italian Pizza", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80" },
  { label: "Pasta Bowl", url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80" },
  { label: "Fresh Drink", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80" },
];

export default function MenuItemForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isEditing = false,
}: MenuItemFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState<number | string>(initialData?.price ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories[0]?.id || "burgers")
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 1);
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || []);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an item name.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Please enter a valid base price.");
      return;
    }

    // Filter out incomplete variants
    const cleanVariants = variants.filter(
      (v) => v.label.trim().length > 0 && v.price > 0
    );

    setError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      categoryId,
      imageUrl: imageUrl.trim() || null,
      isAvailable,
      sortOrder: Number(sortOrder) || 1,
      variants: cleanVariants,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid: Details & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Essential Details (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-[#121212] border-b border-zinc-100 pb-3">
            General Information
          </h2>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classic Chicken Kottu, Margherita Pizza"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ingredients, preparation, taste profile..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Pricing & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Base Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Base Price (Rs.) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variants Section */}
          <div className="pt-4 border-t border-zinc-100">
            <VariantEditor variants={variants} onChange={setVariants} />
          </div>
        </div>

        {/* Right Column: Media & Visibility Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Media Panel */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[#121212] border-b border-zinc-100 pb-3">
              Item Image
            </h2>

            {/* Image Preview Box */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={name || "Preview"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <span className="text-4xl block mb-1">🍽️</span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    No image provided
                  </span>
                </div>
              )}
            </div>

            {/* Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Image Web URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
              />
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Quick Sample Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-[#FF6B2C]/10 hover:text-[#FF6B2C] text-[11px] font-semibold text-zinc-600 transition-colors"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility & Organization Panel */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[#121212] border-b border-zinc-100 pb-3">
              Catalog Settings
            </h2>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div>
                <p className="text-xs font-bold text-[#121212]">Menu Availability</p>
                <p className="text-[11px] text-zinc-500">
                  {isAvailable ? "Item is visible to diners" : "Item is hidden from diners"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAvailable((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAvailable ? "bg-[#198754]" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Status Pill Indicator */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-zinc-500 font-medium">Customer Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  isAvailable
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <label className="text-xs font-bold text-zinc-700">
                Display Sort Order
              </label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
              />
              <span className="text-[11px] text-zinc-400 block">
                Lower numbers appear first within category
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-8 py-3 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/25 flex items-center gap-2"
        >
          <span>💾</span>
          <span>{isEditing ? "Save Changes" : "Save Item"}</span>
        </button>
      </div>
    </form>
  );
}
