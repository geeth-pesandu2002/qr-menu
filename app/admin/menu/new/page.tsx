"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { MenuItem, Category } from "@/src/lib/types";
import { adminFetch } from "@/src/lib/admin-api";

export default function AddMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const json = await adminFetch("/backend-api/categories");
        if (json?.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err: any) {
        console.error("Could not load categories for new menu item:", err);
        setError("Could not load categories from server. Please reload.");
      }
    }
    loadCategories();
  }, []);

  const handleSave = async (itemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await adminFetch("/backend-api/menu-items", {
        method: "POST",
        body: JSON.stringify(itemData),
      });
      router.push("/admin/menu");
    } catch (err: any) {
      console.error("Failed to create menu item on server:", err);
      setError(err?.message || "Failed to create menu item on server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/menu");
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/menu"
              className="text-zinc-400 hover:text-[#121212] transition-colors text-sm font-bold"
            >
              Menu Catalog
            </Link>
            <span className="text-zinc-400 text-xs">/</span>
            <span className="text-xs font-bold text-[#FF6B2C]">Add New Item</span>
          </div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight mt-1">
            Add New Menu Item
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Configure a new dish, set base pricing, upload imagery, and define portion variants
          </p>
        </div>

        <Link
          href="/admin/menu"
          className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5 w-fit"
        >
          <span>←</span>
          <span>Back to Menu List</span>
        </Link>
      </div>

      {/* Reusable Form */}
      <MenuItemForm
        categories={categories}
        onSubmit={handleSave}
        onCancel={handleCancel}
        isEditing={false}
      />
    </div>
  );
}
