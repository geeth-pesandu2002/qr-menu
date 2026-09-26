"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { ThemeToggle } from "@/src/context/ThemeContext";
import { mockCategories, mockMenuItems } from "@/src/mock/menuData";
import { Category, MenuItem, formatPrice } from "@/src/lib/types";
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

  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);

  // Fetch real menu items and categories from backend API
  React.useEffect(() => {
    let isMounted = true;
    async function loadMenuData() {
      try {
        setIsLoadingMenu(true);
        const [catsRes, itemsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu-items"),
        ]);

        if (catsRes.ok) {
          const catsJson = await catsRes.json();
          if (catsJson.success && Array.isArray(catsJson.data) && catsJson.data.length > 0 && isMounted) {
            setCategories(catsJson.data);
          }
        }

        if (itemsRes.ok) {
          const itemsJson = await itemsRes.json();
          if (itemsJson.success && Array.isArray(itemsJson.data) && itemsJson.data.length > 0 && isMounted) {
            setMenuItems(itemsJson.data);
          }
        }
      } catch (err) {
        console.warn("Using offline menu fallback:", err);
      } finally {
        if (isMounted) setIsLoadingMenu(false);
      }
    }
    loadMenuData();
    return () => {
      isMounted = false;
    };
  }, []);

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
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col font-sans pb-24 md:pb-12 select-none relative overflow-x-hidden transition-colors duration-300">
      {/* Ambient Cafe Photography & Glowing Lights fixed in background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <Image
          src="/welcome-ambient-bg.jpg"
          alt="Cafe Ambience"
          fill
          className="object-cover opacity-20 dark:opacity-30 filter blur-[1px] scale-105 transition-opacity duration-700"
          priority
        />
        {/* Vibrant Glassmorphic Lighting Glows */}
        <div className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-[#FF6B2C]/25 dark:bg-[#FF6B2C]/30 blur-[140px] animate-pulse" />
        <div className="absolute top-[25%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E7A451]/20 dark:bg-[#E7A451]/25 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[15%] w-[650px] h-[650px] rounded-full bg-[#FF6B2C]/15 dark:bg-[#198754]/20 blur-[180px]" />
        <div className="absolute inset-0 bg-[#FAF7F2]/75 dark:bg-[#0D0D0D]/85 backdrop-blur-[2px] transition-colors duration-500" />
      </div>

      {/* Top Header - Frosted Glass Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 px-4 sm:px-8 py-3.5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Back Option */}
          <div className="flex items-center gap-3">
            {selectedCategory !== "all" && !searchQuery ? (
              <button
                onClick={() => setSelectedCategory("all")}
                className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 hover:text-[#FF6B2C] dark:hover:text-[#FF6B2C] font-bold text-sm transition-colors py-1"
              >
                <span className="text-lg">←</span>
                <span className="text-base font-extrabold text-[#121212] dark:text-white">
                  {activeCategoryObj?.name || "All Dishes"}
                </span>
              </button>
            ) : (
              <Link href={`/t/${tableId}/welcome`} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#FF6B2C]/30 group-hover:scale-105 transition-transform">
                  🍴
                </div>
                <span className="text-xl font-black tracking-tight text-[#121212] dark:text-white">
                  Dine<span className="text-[#FF6B2C]">Go</span>
                </span>
              </Link>
            )}

            <span className="hidden sm:inline-block text-xs bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-extrabold px-3 py-1 rounded-full border border-white/80 dark:border-white/10 shadow-xs backdrop-blur-md">
              {tableLabel}
            </span>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-600 dark:text-zinc-300">
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
            <Link href="/kitchen/dashboard" className="hover:text-[#FF6B2C] transition-colors flex items-center gap-1 text-zinc-500 hover:text-[#FF6B2C]">
              <span>👨‍🍳</span>
              <span>Kitchen</span>
            </Link>
          </nav>

          {/* Right: Table Info (Mobile), ThemeToggle & Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Global Theme Toggle Button */}
            <ThemeToggle />

            <span className="sm:hidden text-xs bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-extrabold px-2.5 py-1 rounded-full border border-white/80 dark:border-white/10">
              {tableLabel}
            </span>

            {/* Desktop Full Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#E55A1F] hover:from-[#E55A1F] hover:to-[#FF6B2C] text-white font-extrabold text-xs transition-all shadow-md shadow-[#FF6B2C]/30 active:scale-95"
            >
              <span>🛒</span>
              <span>Cart ({itemCount})</span>
              <span className="opacity-90">•</span>
              <span suppressHydrationWarning>{formatPrice(total)}</span>
            </button>

            {/* Mobile Icon-only Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative w-9 h-9 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-colors shadow-xs"
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
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (Frosted Glass Container) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            {/* Category Selector Glass Card */}
            <div className="bg-white/60 dark:bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-5 border border-white/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-3 transition-colors">
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
                      ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/30 font-extrabold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>All Dishes</span>
                  </div>
                  <span className={`text-[11px] ${selectedCategory === "all" ? "text-white/80" : "text-zinc-400"}`}>
                    {menuItems.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = menuItems.filter((m) => m.categoryId === cat.id).length;
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
                          ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/30 font-extrabold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/10"
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

            {/* Venue Info Glass Card on Desktop */}
            <div className="bg-white/50 dark:bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-5 border border-white/80 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] space-y-2.5 text-xs transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-[#121212] dark:text-white">The Cozy Cafe</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
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
                <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-white tracking-tight">
                  {selectedCategory === "all"
                    ? "Our Menu"
                    : activeCategoryObj?.name || "Menu Items"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
                  Explore our delicious food & beverage selection
                </p>
              </div>

              {/* Frosted Glass Search Bar */}
              <div className="relative w-full sm:w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search dishes, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/60 dark:bg-white/[0.08] backdrop-blur-2xl border border-white/80 dark:border-white/15 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-[#121212] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white/90 dark:focus:bg-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-200 dark:bg-white/20 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold hover:bg-zinc-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Horizontal Frosted Category Pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs backdrop-blur-md ${
                  selectedCategory === "all"
                    ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25"
                    : "bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/20 border border-white/80 dark:border-white/10"
                }`}
              >
                ✨ All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs backdrop-blur-md flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25"
                      : "bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/20 border border-white/80 dark:border-white/10"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Screen 3: Category Cards Grid with Frosted Glass */}
            {selectedCategory === "all" && !searchQuery && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => {
                    const count = menuItems.filter((m) => m.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="bg-white/60 dark:bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-3 sm:p-4 border border-white/80 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-2xl hover:-translate-y-1 hover:border-[#FF6B2C]/60 hover:bg-white/80 dark:hover:bg-white/[0.12] transition-all cursor-pointer group flex flex-col items-center text-center gap-3 active:scale-98"
                      >
                        {/* Category Image */}
                        <div className="relative w-full aspect-square max-h-32 sm:max-h-40 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-inner">
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
                          <h3 className="font-extrabold text-sm sm:text-base text-[#121212] dark:text-white group-hover:text-[#FF6B2C] transition-colors">
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

            {/* Screen 4: Food Items Frosted Glass Cards Grid */}
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
                <div className="bg-white/60 dark:bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2 border border-white/80 dark:border-white/15 shadow-sm">
                  <span className="text-5xl block">🔍</span>
                  <p className="font-extrabold text-base text-[#121212] dark:text-white">No dishes found</p>
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
                        className="bg-white/60 dark:bg-white/[0.07] backdrop-blur-2xl p-4 rounded-3xl border border-white/80 dark:border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-2xl hover:-translate-y-0.5 hover:border-[#FF6B2C]/50 hover:bg-white/80 dark:hover:bg-white/[0.12] transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Dish Image */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 shadow-inner">
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
                            <h3 className="font-extrabold text-sm sm:text-base text-[#121212] dark:text-white group-hover:text-[#FF6B2C] transition-colors leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Action Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-white/10">
                          <span className="font-black text-sm sm:text-base text-[#121212] dark:text-white">
                            {formatPrice(item.price)}
                          </span>

                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {qtyInCart > 0 && cartItemId ? (
                              <div className="flex items-center gap-2 bg-white/70 dark:bg-white/10 p-1 rounded-full border border-white/80 dark:border-white/15 shadow-2xs">
                                <button
                                  onClick={() => updateQuantity(cartItemId, -1)}
                                  className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white font-bold flex items-center justify-center text-xs hover:bg-zinc-200 transition-colors shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-extrabold text-xs text-[#121212] dark:text-white">
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
                                className="px-4 py-2 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-xs transition-all shadow-md shadow-[#FF6B2C]/25 flex items-center gap-1.5 active:scale-95"
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
            className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#E55A1F] text-white font-black text-sm shadow-2xl shadow-[#FF6B2C]/50 flex items-center justify-between transition-all transform active:scale-98 pointer-events-auto"
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

      {/* Fixed Bottom Navigation Bar (Visible on Mobile only - Frosted Glass) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/75 dark:bg-black/70 backdrop-blur-2xl border-t border-white/70 dark:border-white/10 px-6 py-2.5 max-w-md mx-auto flex justify-around items-center shadow-2xl">
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
          className="relative flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
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
          className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-[#FF6B2C] font-semibold text-[11px] transition-colors"
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
