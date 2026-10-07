"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { MenuItem, Category } from "@/src/lib/types";
import { getAuthHeaders } from "@/src/lib/auth-client";

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadItemAndCategories() {
      try {
        const [itemRes, catRes] = await Promise.all([
          fetch(`/api/menu-items/${itemId}`),
          fetch("/api/categories"),
        ]);
        if (itemRes.ok) {
          const itemJson = await itemRes.json();
          if (itemJson.success && itemJson.data && isMounted) {
            setItem(itemJson.data);
          }
        }
        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data) && isMounted) {
            setCategories(catJson.data);
          }
        }
      } catch (err) {
        console.warn("Could not load item details for edit:", err);
      }
    }
    loadItemAndCategories();
    return () => {
      isMounted = false;
    };
  }, [itemId]);

  const handleUpdate = async (itemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/menu-items/${itemId}`, {
        method: "PUT",
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
        setErrorMessage(json.error || `Failed to update item (HTTP ${res.status})`);
      }
    } catch (err: any) {
      console.warn("Failed to persist item update:", err);
      setErrorMessage(err?.message || "An unexpected network error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/menu");
  };

  if (!item) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-zinc-500">Loading item details...</p>
      </div>
    );
  }

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
              Edit Item
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight mt-1">
            Edit: {item.name}
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
          initialData={item}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
        />
      </div>
    </div>
  );
}
