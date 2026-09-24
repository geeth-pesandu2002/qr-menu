"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { mockCategories, mockMenuItems } from "@/src/mock/menuData";
import { MenuItem, formatPrice } from "@/src/lib/types";
import ItemModal from "@/src/components/diner/ItemModal";
import CartDrawer from "@/src/components/diner/CartDrawer";

export default function CustomerMenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params);
  const tableId = resolvedParams.tableId || "05";

  const { addToCart, itemCount, total, tableLabel, setTable } = useCart();

  // Set table state on load
  React.useEffect(() => {
    if (tableId) {
      setTable(tableId, `Table ${tableId.padStart(2, "0")}`);
    }
  }, [tableId, setTable]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Filtered menu items based on category pill & search bar input
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#121212] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base">
            🍽️
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DineGo</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="bg-[#FF6B2C] text-white text-xs px-3 py-1 rounded-full font-extrabold shadow-sm">
            {tableLabel}
          </span>
          <Link
            href="/orders"
            className="text-xs bg-white/10 hover:bg-white/20 text-zinc-200 px-3 py-1 rounded-full border border-white/10 transition-all"
          >
            My Orders
          </Link>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="bg-[#121212] text-white px-4 pt-2 pb-6 rounded-b-3xl shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Welcome to</p>
            <h1 className="text-xl font-extrabold text-white">The Cozy Cafe</h1>
            <p className="text-xs text-[#E7A451] font-semibold mt-0.5">Good Food. Good People.</p>
          </div>
          <div className="bg-[#FF6B2C]/10 border border-[#FF6B2C]/30 text-[#FF6B2C] text-center p-3 rounded-xl min-w-[80px]">
            <span className="text-xs text-zinc-400 block font-medium">Table</span>
            <span className="text-2xl font-black">{tableId}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full px-4 pt-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search for dishes, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-full pl-11 pr-4 py-3 text-sm text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Menu Categories
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                selectedCategory === "all"
                  ? "bg-[#FF6B2C] text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              <span>✨</span> All Items
            </button>

            {mockCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                    isSelected
                      ? "bg-[#FF6B2C] text-white"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                  }`}
                >
                  <span>{cat.icon || "🍴"}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Items List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-base text-[#121212]">
              {selectedCategory === "all"
                ? "Our Menu"
                : mockCategories.find((c) => c.id === selectedCategory)?.name}
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              {filteredItems.length} items
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-zinc-500 space-y-2 border border-zinc-200 shadow-sm">
              <span className="text-4xl block">🔍</span>
              <p className="font-bold text-zinc-700">No dishes found</p>
              <p className="text-xs">Try searching for another dish or clear filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                >
                  {/* Food Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-sm text-[#121212] group-hover:text-[#FF6B2C] transition-colors truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="font-extrabold text-sm text-[#FF6B2C] mt-1.5">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.variants && item.variants.length > 0) {
                        setActiveItem(item);
                      } else {
                        addToCart(item, 1);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] hover:bg-[#FF6B2C] hover:text-white font-bold text-xs transition-all flex items-center gap-1 flex-shrink-0"
                  >
                    <span>+</span>
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-sm shadow-xl shadow-[#FF6B2C]/40 flex items-center justify-between transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-[#FF6B2C] font-extrabold text-xs flex items-center justify-center">
                {itemCount}
              </span>
              <span>View Cart</span>
            </div>
            <span>{formatPrice(total)} →</span>
          </button>
        </div>
      )}

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center">
        <button
          onClick={() => setSelectedCategory("all")}
          className="flex flex-col items-center gap-0.5 text-[#FF6B2C] font-bold text-xs"
        >
          <span className="text-lg">📱</span>
          <span>Menu</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-zinc-500 hover:text-[#FF6B2C] text-xs font-semibold"
        >
          <span className="text-lg">🛒</span>
          <span>Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B2C] text-white text-[10px] font-extrabold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

        <Link
          href="/orders"
          className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-[#FF6B2C] text-xs font-semibold"
        >
          <span className="text-lg">👤</span>
          <span>My Orders</span>
        </Link>
      </nav>

      {/* Item Customization Modal */}
      <ItemModal
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onAddToCart={addToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
