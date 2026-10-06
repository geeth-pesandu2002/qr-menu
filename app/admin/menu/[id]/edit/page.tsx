"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { MenuItem, Category } from "@/src/lib/types";
import { adminFetch } from "@/src/lib/admin-api";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadItemAndCategories = async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [itemJson, catJson] = await Promise.all([
        adminFetch(`/backend-api/menu-items/${itemId}`),
        adminFetch("/backend-api/categories"),
      ]);

      if (itemJson?.success && itemJson.data) {
        setItem(itemJson.data);
      } else {
        setNotFound(true);
      }

      if (catJson?.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
      }
    } catch (err: any) {
      console.error("Could not load item details for edit:", err);
      if (err?.status === 404) {
        setNotFound(true);
      } else {
        setError(err?.message || "Failed to load dish details from server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItemAndCategories();
  }, [itemId]);

  const handleUpdate = async (itemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await adminFetch(`/backend-api/menu-items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(itemData),
      });
      router.push("/admin/menu");
    } catch (err: any) {
      console.error("Failed to persist item update:", err);
      setUpdateError(
        err?.message || "Failed to persist changes to the server. Please try again."
      );
    } finally {
      setIsUpdating(false);
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
            <span className="text-xs font-bold text-[#FF6B2C]">Edit Dish</span>
          </div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight mt-1">
            Edit Menu Item
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Modify dish title, description, base pricing, portions, and availability status
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

      {/* Mutation Error Banner */}
      {updateError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{updateError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUpdateError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF6B2C] border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-zinc-500">Loading dish details from server...</p>
        </div>
      )}

      {/* Not Found State */}
      {!isLoading && notFound && (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center text-3xl">
            🍽️
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#121212]">Item Not Found</h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              The requested menu item does not exist or may have been deleted. Fabricated items cannot be edited.
            </p>
          </div>
          <Link
            href="/admin/menu"
            className="inline-flex px-5 py-2.5 rounded-xl bg-[#121212] hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
          >
            Back to Menu Catalog
          </Link>
        </div>
      )}

      {/* Backend Error State */}
      {!isLoading && !notFound && error && (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#121212]">Failed to Load Item</h2>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadItemAndCategories}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20"
            >
              Retry
            </button>
            <Link
              href="/admin/menu"
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Reusable Form populated with real item data */}
      {!isLoading && !notFound && !error && item && (
        <MenuItemForm
          key={item.id}
          initialData={item}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          isEditing={true}
        />
      )}
    </div>
  );
}
