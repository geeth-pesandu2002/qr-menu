"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { mockCategories, mockMenuItems } from "@/src/mock/menuData";
import { MenuItem, formatPrice } from "@/src/lib/types";
import ItemModal from "@/src/components/diner/ItemModal";
import CartDrawer from "@/src/components/diner/CartDrawer";

export default function CustomerMenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const resolvedParams = use(params);
  const tableId = resolvedParams.tableId || "05";

  const { addToCart, updateQuantity, cart, itemCount, total, tableLabel, setTable } = useCart();

  // Set table state on mount
  React.useEffect(() => {
    if (tableId) {
      setTable(tableId, `Table ${tableId.padStart(2, "0")}`);
    }
  }, [tableId, setTable]);

  // "grid" means Screen 3 (Category Overview), or specific category ID for Screen 4 (Category View)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Helper to get total quantity of an item in the cart
  const getItemCartQty = (itemId: string) => {
    return cart
      .filter((ci) => ci.item.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  const getCartItemId = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.id : null;
  };

  // Filtered menu items
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = mockCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans pb-32 select-none">
      {/* Top Header - Screen 3 & 4 */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Left: Brand Logo or Back Button */}
          {selectedCategory !== "all" && !searchQuery ? (
            <button
              onClick={() => setSelectedCategory("all")}
              className="flex items-center gap-2 text-zinc-800 hover:text-[#FF6B2C] font-bold text-sm transition-colors py-1"
            >
              <span className="text-lg">←</span>
              <span className="text-base font-extrabold text-[#121212]">
                {activeCategoryObj?.name || "Burgers"}
              </span>
            </button>
          ) : (
            <Link href={`/t/${tableId}/welcome`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base shadow-sm shadow-[#FF6B2C]/30">
                🍴
              </div>
              <span className="text-xl font-black tracking-tight text-[#121212]">
                Dine<span className="text-[#FF6B2C]">Go</span>
              </span>
            </Link>
          )}

          {/* Right: Table Info & Cart Icon with Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs bg-zinc-100 text-zinc-700 font-extrabold px-2.5 py-1 rounded-full border border-zinc-200">
              {tableLabel}
            </span>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors"
              title="Open Cart"
            >
              <span className="text-lg">🛒</span>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B2C] text-white text-[11px] font-black flex items-center justify-center shadow-md animate-in zoom-in-75"
                  suppressHydrationWarning
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-5 flex-1">
        {/* Title Section (When on main menu or search) */}
        {selectedCategory === "all" && !searchQuery && (
          <div className="space-y-0.5 pt-1">
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">
              Our Menu
            </h1>
            <p className="text-xs text-zinc-500 font-semibold">
              Explore our delicious food
            </p>
          </div>
        )}

        {/* Search Bar with clear button */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search for dishes, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200/90 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:ring-2 focus:ring-[#FF6B2C]/10 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold hover:bg-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Screen 3: 2x2 Category Cards Grid (When on main view and not searching) */}
        {selectedCategory === "all" && !searchQuery && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3.5">
              {mockCategories.map((cat) => {
                const count = mockMenuItems.filter((m) => m.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="bg-white rounded-3xl p-3 border border-zinc-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center gap-2.5 active:scale-98"
                  >
                    {/* Category Image */}
                    <div className="relative w-full aspect-square max-h-28 rounded-2xl overflow-hidden bg-zinc-100">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {cat.icon || "🍴"}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-zinc-400 block mt-0.5">
                        {count} items
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Pills (When viewing a specific category or searching) */}
        {(selectedCategory !== "all" || searchQuery) && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                selectedCategory === "all"
                  ? "bg-[#FF6B2C] text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              All Items
            </button>
            {mockCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? "bg-[#FF6B2C] text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Screen 4: Food Items List */}
        <div className="space-y-3 pt-1">
          {selectedCategory === "all" && !searchQuery && (
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 px-1">
              Popular Dishes
            </h2>
          )}

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-zinc-500 space-y-2 border border-zinc-200/80 shadow-xs">
              <span className="text-4xl block">🔍</span>
              <p className="font-extrabold text-sm text-[#121212]">No dishes found</p>
              <p className="text-xs text-zinc-400">Try searching with a different term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const qtyInCart = getItemCartQty(item.id);
                const cartItemId = getCartItemId(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="bg-white p-3.5 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 cursor-pointer group"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🍴
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className="font-extrabold text-sm text-[#121212] group-hover:text-[#FF6B2C] transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-tight">
                        {item.description}
                      </p>
                      <p className="font-black text-sm text-[#121212] mt-1.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Stepper & Add Action */}
                    <div
                      className="flex items-center gap-1.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {qtyInCart > 0 && cartItemId ? (
                        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                          <button
                            onClick={() => updateQuantity(cartItemId, -1)}
                            className="w-6 h-6 rounded-full bg-white text-zinc-800 font-bold flex items-center justify-center text-xs hover:bg-zinc-200 transition-colors shadow-2xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-extrabold text-xs text-[#121212]">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItemId, 1)}
                            className="w-6 h-6 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center text-xs hover:bg-[#E55A1F] transition-colors shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.variants && item.variants.length > 0) {
                              setActiveItem(item);
                            } else {
                              addToCart(item, 1);
                            }
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <span>+</span>
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-18 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-sm shadow-xl shadow-[#FF6B2C]/40 flex items-center justify-between transition-all transform active:scale-98 pointer-events-auto"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white text-[#FF6B2C] font-black text-xs flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
              <span>View Cart</span>
            </div>
            <span suppressHydrationWarning>{formatPrice(total)} →</span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (Matching Screen 3, 4, 10) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center shadow-lg">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setSearchQuery("");
          }}
          className="flex flex-col items-center gap-1 text-[#FF6B2C] font-extrabold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            📱
          </div>
          <span>Menu</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            🛒
          </div>
          <span>Cart</span>
          {itemCount > 0 && (
            <span
              className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#FF6B2C] text-white text-[9px] font-black flex items-center justify-center"
              suppressHydrationWarning
            >
              {itemCount}
            </span>
          )}
        </button>

        <Link
          href="/orders"
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            👤
          </div>
          <span>My Order</span>
        </Link>
      </nav>

      {/* Screen 5: Item Customization Modal */}
      <ItemModal
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onAddToCart={addToCart}
      />

      {/* Screen 6: Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
