"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItemForm from "@/src/components/admin/menu/MenuItemForm";
import { mockCategories, mockMenuItems } from "@/src/mock/menuData";
import { MenuItem } from "@/src/lib/types";

// Fallback demo item if an unknown ID or 'demo-item' is accessed
const DEFAULT_FALLBACK_ITEM: MenuItem = {
  id: "demo-item",
  name: "Classic Chicken Burger",
  description: "Grilled chicken breast, crisp lettuce, tomato, melted cheddar cheese & signature herb mayonnaise",
  price: 1100,
  categoryId: "burgers",
  imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  isAvailable: true,
  sortOrder: 1,
  variants: [
    { label: "Regular Portion", price: 1100 },
    { label: "Large Portion", price: 1500 },
  ],
};

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  // Find existing mock item by id or fallback to demo
  const item: MenuItem =
    mockMenuItems.find((i) => i.id === itemId) || {
      ...DEFAULT_FALLBACK_ITEM,
      id: itemId,
      name:
        itemId === "demo-item"
          ? DEFAULT_FALLBACK_ITEM.name
          : `Item (${itemId})`,
    };

  const handleUpdate = (itemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    console.log("Updated menu item (mock):", { id: itemId, ...itemData });
    router.push("/admin/menu");
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

      {/* Reusable Form populated with existing item data */}
      <MenuItemForm
        initialData={item}
        categories={mockCategories}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
}
