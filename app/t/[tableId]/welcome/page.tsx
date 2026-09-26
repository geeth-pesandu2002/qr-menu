"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { ThemeToggle } from "@/src/context/ThemeContext";

export default function TableWelcomePage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const resolvedParams = use(params);
  const tableId = resolvedParams.tableId || "05";
  const router = useRouter();
  const { setTable } = useCart();

  React.useEffect(() => {
    if (tableId) {
      setTable(tableId, `Table ${tableId.padStart(2, "0")}`);
    }
  }, [tableId, setTable]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background High-Resolution Cafe Ambience Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/welcome-ambient-bg.jpg"
          alt="Cozy Cafe Ambience"
          fill
          className="object-cover object-center scale-105 filter brightness-75 contrast-105"
          priority
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/70" />
      </div>

      {/* Floating Animated Light Glow Orbs */}
      <div className="absolute top-1/6 left-1/10 w-96 h-96 rounded-full bg-[#FF6B2C]/25 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/6 right-1/10 w-[450px] h-[450px] rounded-full bg-[#E7A451]/20 blur-[140px] pointer-events-none animate-[pulse_5s_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />

      {/* Responsive Floating Glass Header */}
      <header className="relative z-30 px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 px-5 sm:px-8 py-3 rounded-full shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white shadow-lg shadow-[#FF6B2C]/40 text-lg group-hover:scale-105 transition-transform">
              🍴
            </div>
            <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
              Dine<span className="text-[#FF6B2C]">Go</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-extrabold text-zinc-200">
            <Link
              href={`/t/${tableId}`}
              className="hover:text-[#FF6B2C] transition-colors flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>Digital Menu</span>
            </Link>
            <Link
              href="/orders"
              className="hover:text-[#FF6B2C] transition-colors flex items-center gap-1.5"
            >
              <span>📜</span>
              <span>My Orders</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-full border border-white/20 text-white font-bold text-xs backdrop-blur-sm shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Table {tableId}</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Right Header: Table Badge + ThemeToggle */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full border border-white/20 text-white font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Table {tableId}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="relative z-20 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Cafe Table Photo with Radiant Glow */}
          <div className="lg:col-span-6 relative">
            {/* Radiant Gradient Glow Behind Photo Frame */}
            <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-[#FF6B2C]/50 via-[#E7A451]/40 to-[#FF6B2C]/30 rounded-[40px] blur-2xl opacity-75 animate-pulse" />

            <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 group">
              <Image
                src="/table-05-welcome.jpg"
                alt={`Table ${tableId}`}
                fill
                className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Floating Verified Glass Badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black text-white border border-white/25 shadow-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Table {tableId} Active</span>
              </div>

              {/* Bottom Subtle Overlay Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 backdrop-blur-md bg-black/40 px-4 py-2.5 rounded-2xl border border-white/15">
                <span className="font-bold flex items-center gap-1.5">
                  <span>☕</span> Fresh Brews & Artisan Bites
                </span>
                <span className="text-[11px] font-semibold text-amber-300">
                  Ready to Order
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: True Glassmorphic Welcome Card */}
          <div className="lg:col-span-6">
            <div className="bg-white/15 backdrop-blur-2xl rounded-[36px] p-6 sm:p-10 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.5)] text-white space-y-6 relative overflow-hidden">
              {/* Top Glass Specular Line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

              {/* Headline Block */}
              <div className="space-y-2 relative">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-[#FF854D] border border-white/25 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-inner">
                  <span>✨</span>
                  <span>Welcome to</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                  The Cozy Cafe
                </h1>

                <p className="text-sm font-medium text-zinc-200 leading-relaxed drop-shadow-xs">
                  Good Food. Good People. Delicious moments crafted fresh for your table.
                </p>
              </div>

              {/* Verification & Table Status Box (Frosted Inset) */}
              <div className="bg-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/20 shadow-inner flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg font-black shadow-[0_0_25px_rgba(16,185,129,0.55)] flex-shrink-0">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <span className="font-black text-lg text-white block leading-tight drop-shadow-xs">
                    Table {tableId} Identified
                  </span>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    You&apos;re all set! Browse dishes, customize your flavors, and place orders directly to our kitchen.
                  </p>
                </div>
              </div>

              {/* 4 Feature Highlights Grid (Frosted Glass Pills) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold text-white shadow-xs hover:scale-[1.02]">
                  <span className="text-base text-amber-400 drop-shadow-xs">⚡</span>
                  <span>Fast Kitchen Dispatch</span>
                </div>

                <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold text-white shadow-xs hover:scale-[1.02]">
                  <span className="text-base text-indigo-300 drop-shadow-xs">📱</span>
                  <span>Live Order Tracking</span>
                </div>

                <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold text-white shadow-xs hover:scale-[1.02]">
                  <span className="text-base text-emerald-400 drop-shadow-xs">💳</span>
                  <span>Instant Digital Bill</span>
                </div>

                <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold text-white shadow-xs hover:scale-[1.02]">
                  <span className="text-base text-sky-400 drop-shadow-xs">📶</span>
                  <span>Free High-Speed WiFi</span>
                </div>
              </div>

              {/* Glowing CTA Button */}
              <div className="space-y-3 pt-2">
                <Link
                  href={`/t/${tableId}`}
                  className="w-full py-4 sm:py-4.5 px-6 rounded-full bg-gradient-to-r from-[#FF6B2C] via-[#FF7B42] to-[#E55A1F] hover:from-[#E55A1F] hover:to-[#FF6B2C] text-white font-black text-base tracking-wide transition-all shadow-[0_12px_40px_rgba(255,107,44,0.55)] hover:shadow-[0_16px_50px_rgba(255,107,44,0.75)] flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
                >
                  {/* Interactive Shimmer Sheen */}
                  <span className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-[-25deg] -translate-x-full group-hover:translate-x-[350%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 drop-shadow-sm">View Menu</span>
                  <span className="relative z-10 text-xl font-bold group-hover:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </Link>

                {/* Elegant Cursive Script with Warm Amber Glow */}
                <div className="text-center pt-2">
                  <p className="font-serif italic text-3xl sm:text-4xl text-amber-200 drop-shadow-[0_2px_15px_rgba(251,191,36,0.45)]">
                    Enjoy your meal!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-20 text-center text-xs text-zinc-400/80 py-4 border-t border-white/10 backdrop-blur-md">
        DineGo Digital QR Menu &bull; The Cozy Cafe
      </footer>
    </div>
  );
}
