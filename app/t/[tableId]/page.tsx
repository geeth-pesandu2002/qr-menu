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
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans pb-24 md:pb-12 select-none">
      {/* Top Header - Responsive for Mobile & Desktop */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Back Option */}
          <div className="flex items-center gap-3">
            {selectedCategory !== "all" && !searchQuery ? (
              <button
                onClick={() => setSelectedCategory("all")}
                className="flex items-center gap-2 text-zinc-800 hover:text-[#FF6B2C] font-bold text-sm transition-colors py-1"
              >
                <span className="text-lg">←</span>
                <span className="text-base font-extrabold text-[#121212]">
                  {activeCategoryObj?.name || "All Dishes"}
                </span>
              </button>
            ) : (
              <Link href={`/t/${tableId}/welcome`} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base shadow-sm shadow-[#FF6B2C]/30">
                  🍴
                </div>
                <span className="text-xl font-black tracking-tight text-[#121212]">
                  Dine<span className="text-[#FF6B2C]">Go</span>
                </span>
              </Link>
            )}

            <span className="hidden sm:inline-block text-xs bg-zinc-100 text-zinc-700 font-extrabold px-3 py-1 rounded-full border border-zinc-200">
              {tableLabel}
            </span>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-600">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className={`${selectedCategory === "all" && !searchQuery ? "text-[#FF6B2C]" : "hover:text-[#FF6B2C]"} transition-colors`}
            >
              Full Menu
            </button>
            <Link href="/orders" className="hover:text-[#FF6B2C] transition-colors">
              My Orders
            </Link>
            <Link href="/scan" className="hover:text-[#FF6B2C] transition-colors">
              Switch Table
            </Link>
          </nav>

          {/* Right: Table Info (Mobile) & Cart Button */}
          <div className="flex items-center gap-3">
            <span className="sm:hidden text-xs bg-zinc-100 text-zinc-700 font-extrabold px-2.5 py-1 rounded-full border border-zinc-200">
              {tableLabel}
            </span>

            {/* Desktop Full Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-xs transition-all shadow-md shadow-[#FF6B2C]/20 active:scale-95"
            >
              <span>🛒</span>
              <span>Cart ({itemCount})</span>
              <span className="opacity-90">•</span>
              <span suppressHydrationWarning>{formatPrice(total)}</span>
            </button>

            {/* Mobile Icon-only Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors"
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

      {/* Main Responsive Grid Layout (Sidebar on Desktop + Main Content) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (Categories & Venue Info) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            {/* Category Selector Card */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 px-1">
                Categories
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    selectedCategory === "all"
                      ? "bg-[#FF6B2C] text-white shadow-xs font-extrabold"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>All Dishes</span>
                  </div>
                  <span className={`text-[11px] ${selectedCategory === "all" ? "text-white/80" : "text-zinc-400"}`}>
                    {mockMenuItems.length}
                  </span>
                </button>

                {mockCategories.map((cat) => {
                  const count = mockMenuItems.filter((m) => m.categoryId === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#FF6B2C] text-white shadow-xs font-extrabold"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <span className={`text-[11px] ${isSelected ? "text-white/80" : "text-zinc-400"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venue Info Card on Desktop */}
            <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-zinc-200/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-[#121212]">The Cozy Cafe</span>
              </div>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Table {tableId} &bull; Orders are sent directly to the kitchen line in real-time.
              </p>
              <div className="pt-1 text-[11px] text-zinc-400 flex items-center gap-2">
                <span>📶</span>
                <span>WiFi: CozyCafe-Guest</span>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="col-span-1 lg:col-span-9 space-y-6">
            {/* Title & Search Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#121212] tracking-tight">
                  {selectedCategory === "all"
                    ? "Our Menu"
                    : activeCategoryObj?.name || "Menu Items"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-0.5">
                  Explore our delicious food & beverage selection
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search dishes, ingredients..."
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
            </div>

            {/* Mobile Horizontal Category Pills (When not in desktop sidebar) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                  selectedCategory === "all"
                    ? "bg-[#FF6B2C] text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                }`}
              >
                ✨ All Items
              </button>
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 ${
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

            {/* Screen 3: 2x2 Category Cards Grid on Mobile / 4-column on Desktop (When on All and no search) */}
            {selectedCategory === "all" && !searchQuery && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mockCategories.map((cat) => {
                    const count = mockMenuItems.filter((m) => m.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="bg-white rounded-3xl p-3 sm:p-4 border border-zinc-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center gap-3 active:scale-98"
                      >
                        {/* Category Image */}
                        <div className="relative w-full aspect-square max-h-32 sm:max-h-40 rounded-2xl overflow-hidden bg-zinc-100">
                          {cat.imageUrl ? (
                            <Image
                              src={cat.imageUrl}
                              alt={cat.name}
                              fill
                              className="object-cover group-hover:scale-108 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {cat.icon || "🍴"}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 block mt-0.5">
                            {count} items
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Screen 4: Food Items Responsive Grid (1 col on mobile, 2 on tablet, 2 or 3 on desktop) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  {selectedCategory === "all" ? "Available Dishes" : `${activeCategoryObj?.name} Selection`}
                </h2>
                <span className="text-xs font-bold text-zinc-400">
                  {filteredItems.length} dishes
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-zinc-500 space-y-2 border border-zinc-200/80 shadow-xs">
                  <span className="text-5xl block">🔍</span>
                  <p className="font-extrabold text-base text-[#121212]">No dishes found</p>
                  <p className="text-xs text-zinc-400">
                    Try searching for another dish or clear category filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredItems.map((item) => {
                    const qtyInCart = getItemCartQty(item.id);
                    const cartItemId = getCartItemId(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveItem(item)}
                        className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Dish Image */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-106 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🍴
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base text-[#121212] group-hover:text-[#FF6B2C] transition-colors leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Action Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                          <span className="font-black text-sm sm:text-base text-[#121212]">
                            {formatPrice(item.price)}
                          </span>

                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {qtyInCart > 0 && cartItemId ? (
                              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                                <button
                                  onClick={() => updateQuantity(cartItemId, -1)}
                                  className="w-7 h-7 rounded-full bg-white text-zinc-800 font-bold flex items-center justify-center text-xs hover:bg-zinc-200 transition-colors shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-extrabold text-xs text-[#121212]">
                                  {qtyInCart}
                                </span>
                                <button
                                  onClick={() => updateQuantity(cartItemId, 1)}
                                  className="w-7 h-7 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center text-xs hover:bg-[#E55A1F] transition-colors shadow-2xs"
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
                                className="px-4 py-2 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                              >
                                <span>+</span>
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Cart Bar (Visible on Mobile only) */}
      {itemCount > 0 && (
        <div className="md:hidden fixed bottom-18 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
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

      {/* Fixed Bottom Navigation Bar (Visible on Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center shadow-lg">
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
