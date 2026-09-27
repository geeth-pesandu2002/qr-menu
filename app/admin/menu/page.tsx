"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MenuItem, Category, formatPrice } from "@/src/lib/types";
import { mockCategories, mockMenuItems } from "@/src/mock/menuData";

// Initial mock items list with a couple of unavailable items for realistic demo
const INITIAL_ADMIN_MENU_ITEMS: MenuItem[] = [
  ...mockMenuItems,
  {
    id: "d3",
    name: "Fresh Strawberry Shake",
    description: "Seasonal fresh strawberries blended with chilled fresh milk",
    price: 850,
    categoryId: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    isAvailable: false, // Unavailable demonstration
    sortOrder: 8,
    variants: [],
  },
  {
    id: "des2",
    name: "Classic Tiramisu",
    description: "Traditional Italian dessert with mascarpone and espresso soaked biscuits",
    price: 950,
    categoryId: "desserts",
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
    isAvailable: false, // Unavailable demonstration
    sortOrder: 9,
    variants: [],
  },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_ADMIN_MENU_ITEMS);
  const [categories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState<
    "ALL" | "AVAILABLE" | "UNAVAILABLE"
  >("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Compute summary stats
  const totalItems = items.length;
  const availableItems = items.filter((item) => item.isAvailable).length;
  const unavailableItems = items.filter((item) => !item.isAvailable).length;
  const totalCategories = categories.length;

  // Toggle single item availability
  const handleToggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isAvailable: !item.isAvailable, updatedAt: Date.now() }
          : item
      )
    );
  };

  // Delete item handler (local mock state only)
  const confirmDelete = () => {
    if (!itemToDelete) return;
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete.id));
    setItemToDelete(null);
  };

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || item.categoryId === selectedCategory;

    const matchesAvailability =
      selectedAvailability === "ALL"
        ? true
        : selectedAvailability === "AVAILABLE"
        ? item.isAvailable
        : !item.isAvailable;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍴</span>
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">
              Menu Items Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Create, update dishes, configure portion variants, and control customer availability
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/menu/new"
            className="px-4 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add New Item</span>
          </Link>
          <button
            onClick={() => setItems(INITIAL_ADMIN_MENU_ITEMS)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Reset menu mock items"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Items
            </p>
            <p className="text-3xl font-black text-[#121212]">{totalItems}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Catalog items</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B2C] flex items-center justify-center text-xl font-bold flex-shrink-0">
            🍴
          </div>
        </div>

        {/* Available Items */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Available Items
            </p>
            <p className="text-3xl font-black text-[#121212]">{availableItems}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Active on diner menu</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#198754] flex items-center justify-center text-xl font-bold flex-shrink-0">
            ✓
          </div>
        </div>

        {/* Unavailable Items */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Unavailable Items
            </p>
            <p className="text-3xl font-black text-[#121212]">{unavailableItems}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Hidden from customers</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
            ⏸️
          </div>
        </div>

        {/* Menu Categories */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Menu Categories
            </p>
            <p className="text-3xl font-black text-[#121212]">{totalCategories}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Sections organized</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#F4B400] flex items-center justify-center text-xl font-bold flex-shrink-0">
            🏷️
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by dish name or description..."
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#FF6B2C]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={selectedAvailability}
            onChange={(e) =>
              setSelectedAvailability(
                e.target.value as "ALL" | "AVAILABLE" | "UNAVAILABLE"
              )
            }
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#FF6B2C]"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>

          {(searchQuery ||
            selectedCategory !== "ALL" ||
            selectedAvailability !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedAvailability("ALL");
              }}
              className="text-xs text-[#FF6B2C] hover:underline font-bold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredItems.length > 0 &&
                      selectedIds.length === filteredItems.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#FF6B2C] focus:ring-[#FF6B2C]"
                  />
                </th>
                <th className="py-3.5 px-4 w-16">Item</th>
                <th className="py-3.5 px-4">Name & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <span className="text-3xl block mb-2">🔍</span>
                    <p className="font-bold text-zinc-600">No menu items found</p>
                    <p className="text-xs text-zinc-400">
                      Try adjusting your filters or search keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const category = categories.find((c) => c.id === item.categoryId);
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isSelected ? "bg-orange-50/30" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded text-[#FF6B2C] focus:ring-[#FF6B2C]"
                        />
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              🍽️
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Description */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#121212]">
                            {item.name}
                          </span>
                          {item.variants && item.variants.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/20">
                              {item.variants.length} sizes
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 font-semibold text-xs border border-zinc-200/70">
                          <span>{category?.icon || "🍴"}</span>
                          <span>{category?.name || item.categoryId}</span>
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="py-4 px-4 whitespace-nowrap font-black text-sm text-[#121212]">
                        {formatPrice(item.price)}
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                            item.isAvailable
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                          }`}
                          title="Click to toggle availability"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isAvailable ? "bg-[#198754]" : "bg-zinc-400"
                            }`}
                          />
                          <span>{item.isAvailable ? "Available" : "Unavailable"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/menu/${item.id}/edit`}
                            className="p-2 rounded-xl text-zinc-500 hover:text-[#FF6B2C] hover:bg-[#FF6B2C]/10 transition-colors"
                            title="Edit Item"
                          >
                            ✏️
                          </Link>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Item"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Item Count */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>
            Showing {filteredItems.length} of {totalItems} items
          </span>
          {selectedIds.length > 0 && (
            <span className="font-bold text-[#FF6B2C]">
              {selectedIds.length} items selected
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-[#121212]">
                Delete Menu Item?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-zinc-800">&quot;{itemToDelete.name}&quot;</strong>?
                This action only deletes from local mock state in this milestone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
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
