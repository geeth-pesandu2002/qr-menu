"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/src/lib/types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<Category>) => void;
  category?: Category | null;
}

const POPULAR_ICONS = ["🍔", "🍕", "🍝", "🥤", "🍰", "🍚", "🥟", "☕", "🥗", "🍗", "🥪", "🍦"];

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [description, setDescription] = useState(""); // UI-only field as requested
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || "🍽️");
      setImageUrl(category.imageUrl || "");
      setSortOrder(category.sortOrder || 1);
      setIsActive(category.isActive ?? true);
      setDescription("");
    } else {
      setName("");
      setIcon("🍽️");
      setImageUrl("");
      setSortOrder(1);
      setIsActive(true);
      setDescription("");
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    onSave({
      ...(category ? { id: category.id } : {}),
      name: name.trim(),
      icon: icon.trim() || undefined,
      imageUrl: imageUrl.trim() || null,
      sortOrder: Number(sortOrder) || 1,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏷️</span>
              <h2 className="text-lg font-black text-[#121212]">
                {category ? "Edit Category" : "Add New Category"}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {category
                ? "Update category details and customer visibility"
                : "Create a new section for your digital menu"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Burgers, Artisan Pizzas, Desserts"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              Category Icon
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 text-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
                {icon || "🍽️"}
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Emoji or character"
                className="w-24 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-center text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
              />
              <span className="text-[11px] text-zinc-400">
                Pick a quick preset below or type any emoji
              </span>
            </div>

            {/* Quick Emoji Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                    icon === emoji
                      ? "bg-[#FF6B2C] text-white shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Category Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Cover Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Display Sort Order
            </label>
            <input
              type="number"
              min="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
            <span className="text-[11px] text-zinc-400 block">
              Determines position in diner menu pill list (lower = earlier)
            </span>
          </div>

          {/* Active / Inactive Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <div>
              <p className="text-xs font-bold text-[#121212]">Category Status</p>
              <p className="text-[11px] text-zinc-500">
                {isActive
                  ? "Active • Section is visible to diners"
                  : "Inactive • Section is hidden from diners"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-[#198754]" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Optional Description (UI-only) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700">
                Internal Description
              </label>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                UI Reference
              </span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Lunch and dinner gourmet burger selection..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/25"
            >
              {category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
