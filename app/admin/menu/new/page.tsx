"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { mockCategories } from "@/src/mock/menuData";
import { MenuItem, Category } from "@/src/lib/types";

export default function AddMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setCategories(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not load categories for new menu item:", err);
      }
    }
    loadCategories();
  }, []);

  const handleSave = async (itemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer owner-token",
        },
        body: JSON.stringify(itemData),
      });
    } catch (err) {
      console.warn("Failed to create menu item on server:", err);
    } finally {
      setIsSubmitting(false);
      router.push("/admin/menu");
    }
  };

  const handleCancel = () => {
    router.push("/admin/menu");
  };

  return (
    <div className="space-y-6 font-sans pb-16">
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
