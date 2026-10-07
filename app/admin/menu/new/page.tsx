"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { MenuItem, Category } from "@/src/lib/types";
import { getAuthHeaders } from "@/src/lib/auth-client";

export default function AddMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
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
    setErrorMessage(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(itemData),
      });

      if (res.ok) {
        router.push("/admin/menu");
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMessage(json.error || `Failed to create item (HTTP ${res.status})`);
      }
    } catch (err: any) {
      console.warn("Failed to create menu item on server:", err);
      setErrorMessage(err?.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
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
            <Link href="/admin/menu" className="text-zinc-400 hover:text-zinc-600 text-sm transition-colors">
              ← Menu
            </Link>
            <span className="text-zinc-300">•</span>
            <span className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wider">
              Create Item
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight mt-1">
            Add New Menu Item
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-red-500 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs">
        <MenuItemForm
          categories={categories}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
