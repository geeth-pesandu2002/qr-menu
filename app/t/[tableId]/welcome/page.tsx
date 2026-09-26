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
      {/* Top Header */}
      <header className="px-5 py-4 flex items-center justify-between max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white shadow-md shadow-[#FF6B2C]/25 text-lg">
            🍴
          </div>
          <span className="text-xl font-black tracking-tight text-[#121212]">
            Dine<span className="text-[#FF6B2C]">Go</span>
          </span>
        </Link>

        <button
          onClick={() => router.push(`/t/${tableId}`)}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-all text-xl"
        >
          ≡
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-5 py-2 flex flex-col justify-between">
        {/* Welcome Text */}
        <div className="text-center space-y-1 pt-2 pb-4">
          <p className="text-xs uppercase tracking-wider font-extrabold text-[#FF6B2C]">
            Welcome to
          </p>
          <h1 className="text-3xl font-black text-[#121212] tracking-tight">
            The Cozy Cafe
          </h1>
          <p className="text-xs text-zinc-500 font-semibold">
            Good Food. Good People.
          </p>
        </div>

        {/* Real Cafe Table with Table Number Photo */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-black/5">
          <Image
            src="/table-05-welcome.jpg"
            alt={`Table ${tableId}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Identification Confirmation Card */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xl text-center space-y-4 my-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#06402B] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-900/20">
              ✓
            </div>
            <div className="text-left">
              <span className="font-black text-lg text-[#121212] block leading-none">
                Table {tableId}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400">
                You&apos;re all set!
              </span>
            </div>
          </div>

          <Link
            href={`/t/${tableId}`}
            className="w-full py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>View Menu</span>
            <span className="text-base">→</span>
          </Link>

          <p className="font-serif italic text-2xl text-[#121212]/70 pt-1">
            Enjoy your meal!
          </p>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-zinc-400 py-3">
        DineGo Digital QR Menu
      </footer>
    </div>
  );
}
