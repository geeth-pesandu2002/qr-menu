"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";

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
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans select-none">
      {/* Responsive Top Header */}
      <header className="px-4 sm:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white shadow-md shadow-[#FF6B2C]/25 text-lg">
              🍴
            </div>
            <span className="text-xl font-black tracking-tight text-[#121212]">
              Dine<span className="text-[#FF6B2C]">Go</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-600">
            <Link href={`/t/${tableId}`} className="hover:text-[#FF6B2C] transition-colors">
              Digital Menu
            </Link>
            <Link href="/orders" className="hover:text-[#FF6B2C] transition-colors">
              My Orders
            </Link>
            <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full border border-zinc-200">
              Table {tableId}
            </span>
          </div>

          <button
            onClick={() => router.push(`/t/${tableId}`)}
            className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-all text-xl md:hidden"
          >
            ≡
          </button>
        </div>
      </header>

      {/* Main Container - 1 Column on Mobile, 2 Columns on Desktop */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Cafe Table Photo */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-black/5 group">
            <Image
              src="/table-05-welcome.jpg"
              alt={`Table ${tableId}`}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-[#121212] shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Table {tableId} Confirmed</span>
            </div>
          </div>

          {/* Welcome Card & Action Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#FF6B2C]/10 text-[#FF6B2C] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <span>✨</span> Welcome to
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
                The Cozy Cafe
              </h1>
              <p className="text-sm font-semibold text-zinc-500">
                Good Food. Good People. Delicious moments await your table.
              </p>
            </div>

            {/* Verification Badge */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-zinc-200/80 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#06402B] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-emerald-900/20 flex-shrink-0">
                ✓
              </div>
              <div>
                <span className="font-black text-lg text-[#121212] block leading-none">
                  Table {tableId}
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  You&apos;re all set! Browse the contactless menu and order right from your seat.
                </span>
              </div>
            </div>

            {/* Feature Highlights on Desktop */}
            <div className="hidden sm:grid grid-cols-2 gap-3 text-xs text-zinc-600 font-semibold pt-1">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Fast Kitchen Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>Live Order Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>Instant Digital Bill</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📶</span>
                <span>Free High-Speed WiFi</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/t/${tableId}`}
                className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>View Menu</span>
                <span className="text-lg">→</span>
              </Link>

              <div className="text-center pt-2">
                <p className="font-serif italic text-2xl text-[#121212]/75">
                  Enjoy your meal!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-zinc-400 py-4 border-t border-zinc-200/50">
        DineGo Digital QR Menu &bull; The Cozy Cafe
      </footer>
    </div>
  );
}
