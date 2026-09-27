"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";

export default function ScanPage() {
  const router = useRouter();
  const { setTable } = useCart();
  const [tableInput, setTableInput] = useState("05");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableInput.trim()) return;
    const cleanNumber = tableInput.trim();
    setTable(cleanNumber);
    router.push(`/t/${cleanNumber}`);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between p-6 font-sans">
      {/* Top Header */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full pt-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-base">
            🍽️
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DineGo</span>
        </Link>
        <button
          onClick={() => router.push("/t/05")}
          className="text-xs bg-white/10 hover:bg-white/20 text-zinc-200 px-3 py-1.5 rounded-full border border-white/10"
        >
          EN ▾
        </button>
      </header>

      {/* Main Scanner Container */}
      <main className="max-w-md mx-auto w-full flex flex-col items-center gap-6 py-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Scan QR Code</h1>
          <p className="text-xs text-zinc-400 max-w-xs">
            Point your camera at the QR code on your table to open the digital menu.
          </p>
        </div>

        {/* Camera Frame Mockup */}
        <div className="relative w-64 h-64 rounded-3xl bg-zinc-900 border-2 border-zinc-700 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          {/* Animated Scanning Line */}
          <div className="absolute inset-x-0 h-1 bg-[#FF6B2C] shadow-[0_0_15px_#FF6B2C] animate-pulse top-1/2 -translate-y-1/2" />

          {/* Target Corner Guides */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#FF6B2C] rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#FF6B2C] rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#FF6B2C] rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#FF6B2C] rounded-br-xl" />

          <span className="text-5xl opacity-40">📷</span>
          <span className="text-xs text-zinc-500 mt-2 font-medium">Position QR Code within frame</span>
        </div>

        {/* Manual Table Number Fallback */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>💡</span>
            <span>No camera? Enter table number manually</span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Table Number (e.g. 05)"
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B2C]"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-base transition-all flex items-center justify-center shadow-lg shadow-[#FF6B2C]/20"
            >
              →
            </button>
          </form>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-zinc-500 py-2">
        Good Food. Good People.
      </footer>
    </div>
  );
}
