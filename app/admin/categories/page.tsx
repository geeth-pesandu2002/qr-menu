"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/src/lib/types";
import CategoryModal from "@/src/components/admin/categories/CategoryModal";
import { adminFetch } from "@/src/lib/admin-api";

interface AdminCategoryItem extends Category {
  itemsCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategoryItem | null>(null);

  // Live category loading from backend
  const loadCategories = async () => {
    try {
      const json = await adminFetch("/backend-api/categories");
      if (json?.success && Array.isArray(json.data)) {
        setCategories(
          json.data.map((c: Category) => ({
            ...c,
            itemsCount: (c as AdminCategoryItem).itemsCount ?? 0,
          }))
        );
      }
      setError(null);
    } catch (err: any) {
      console.error("Could not fetch live categories:", err);
      setError(err?.message || "Failed to load categories from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Summary Metrics
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;
  const totalItemsAssigned = categories.reduce((sum, c) => sum + c.itemsCount, 0);

  // Toggle active status with confirmed backend sync (no premature UI update)
  const handleToggleStatus = async (id: string) => {
    const currentCat = categories.find((c) => c.id === id);
    if (!currentCat) return;
    const newStatus = !currentCat.isActive;
    setActionError(null);

    try {
      await adminFetch(`/backend-api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: newStatus }),
      });

      // Confirmed success: update local state
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return { ...c, isActive: newStatus, updatedAt: Date.now() };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error("Failed to update category status on server:", err);
      setActionError(err?.message || "Failed to update category status on server. Please try again.");
    }
  };

  // Save (Create or Edit) with confirmed backend sync (no premature UI update)
  const handleSaveCategory = async (data: Partial<Category>) => {
    setActionError(null);
    if (editingCategory) {
      try {
        await adminFetch(`/backend-api/categories/${editingCategory.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        // Confirmed success: update local state
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, ...data, updatedAt: Date.now() }
              : c
          )
        );
        setIsModalOpen(false);
        setEditingCategory(null);
      } catch (err: any) {
        console.error("Failed to update category on server:", err);
        setActionError(err?.message || "Failed to update category on server. Please try again.");
      }
    } else {
      const newCategoryPayload = {
        name: data.name || "Untitled Category",
        icon: data.icon || "🍽️",
        sortOrder: data.sortOrder || categories.length + 1,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      };

      try {
        await adminFetch("/backend-api/categories", {
          method: "POST",
          body: JSON.stringify(newCategoryPayload),
        });

        await loadCategories();
        setIsModalOpen(false);
        setEditingCategory(null);
      } catch (err: any) {
        console.error("Failed to create category on server:", err);
        setActionError(err?.message || "Failed to create category on server. Please try again.");
      }
    }
  };

  // Delete with confirmed backend sync (no premature UI update)
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id;
    setActionError(null);

    try {
      await adminFetch(`/backend-api/categories/${catId}`, {
        method: "DELETE",
      });

      // Confirmed success: remove from local state
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete category on server:", err);
      setActionError(err?.message || "Failed to delete category on server. Please try again.");
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? c.isActive
        : !c.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">
              Categories Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Organize your menu catalog into structured diner sections and control section visibility
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Category</span>
          </button>
          <button
            type="button"
            onClick={loadCategories}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Refresh categories list"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Notification Banner */}
      {(error || actionError) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{actionError || error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setActionError(null);
            }}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Summary Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Categories */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Active Categories
            </p>
            <p className="text-3xl font-black text-[#121212]">
              {activeCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {categories.length} total sections configured
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#198754] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            ✓
          </div>
        </div>

        {/* Items Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Items Assigned
            </p>
            <p className="text-3xl font-black text-[#121212]">
              {totalItemsAssigned}
            </p>
            <p className="text-[11px] text-zinc-500 font-semibold">
              Across active diner categories
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B2C] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            🍴
          </div>
        </div>

        {/* Inactive Categories */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Inactive Categories
            </p>
            <p className="text-3xl font-black text-[#121212] truncate">
              {inactiveCount}
            </p>
            <p className="text-[11px] text-zinc-500 font-semibold">
              Hidden from customer view
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            ⏸️
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs / Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-semibold hidden sm:inline">Status:</span>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => {
            const isSelected = statusFilter === status;
            const label = status === "ALL" ? "All" : status === "ACTIVE" ? "Active" : "Inactive";
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isSelected
                    ? "bg-[#121212] text-white shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-14">Order</th>
                <th className="py-3.5 px-4 w-16">Icon</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Items Assigned</th>
                <th className="py-3.5 px-4">Sort Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <span className="text-3xl block mb-2">🏷️</span>
                    <p className="font-bold text-zinc-600">No categories found</p>
                    <p className="text-xs text-zinc-400">
                      Try adjusting your search query or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Sort/Order Position */}
                    <td className="py-4 px-4 font-mono font-bold text-zinc-400">
                      #{index + 1}
                    </td>

                    {/* Icon or Image */}
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-xl shadow-xs overflow-hidden">
                        {cat.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{cat.icon || "🍽️"}</span>
                        )}
                      </div>
                    </td>

                    {/* Category Name */}
                    <td className="py-4 px-4">
                      <span className="font-black text-sm text-[#121212] block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Identifier: {cat.id}
                      </span>
                    </td>

                    {/* Items Assigned */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 font-semibold text-xs border border-zinc-200/70">
                        <span>🍴</span>
                        <span>{cat.itemsCount} dishes</span>
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-zinc-800 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md">
                        {cat.sortOrder}
                      </span>
                    </td>

                    {/* Status (Strictly Active or Inactive) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive ? "bg-[#198754]" : "bg-zinc-400"
                          }`}
                        />
                        <span>{cat.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-zinc-500 hover:text-[#FF6B2C] hover:bg-[#FF6B2C]/10 transition-colors"
                          title="Edit Category"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Category"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>
            Showing {filteredCategories.length} of {categories.length} categories
          </span>
          <Link
            href="/admin/menu"
            className="text-xs font-bold text-[#FF6B2C] hover:underline"
          >
            View Menu Catalog →
          </Link>
        </div>
      </div>

      {/* Add / Edit Category Modal Drawer */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-[#121212]">
                Delete Category?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-zinc-800">&quot;{categoryToDelete.name}&quot;</strong>?
                This action only deletes from local mock state in this milestone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
