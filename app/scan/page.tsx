"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";

export default function ScanPage() {
  const router = useRouter();
  const { setTable } = useCart();
  const [tableInput, setTableInput] = useState("05");
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setTable("05", "Table 05");
      router.push("/t/05/welcome");
    }, 900);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableInput.trim()) return;
    const cleanNumber = tableInput.trim().padStart(2, "0");
    setTable(cleanNumber, `Table ${cleanNumber}`);
    router.push(`/t/${cleanNumber}/welcome`);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background Ambience with blur */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="/hero-bg.jpg"
          alt="Cafe Ambience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/90 via-[#121212]/95 to-[#121212]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 flex justify-between items-center max-w-md mx-auto w-full pt-1">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white shadow-md shadow-[#FF6B2C]/30 text-lg">
            🍴
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Dine<span className="text-[#FF6B2C]">Go</span>
          </span>
        </Link>

        {/* Language selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="text-xs font-bold bg-white/10 hover:bg-white/15 text-zinc-200 px-3.5 py-1.5 rounded-full border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-sm"
          >
            <span>{language}</span>
            <span className="text-[10px]">▾</span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-24 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-30">
              {["EN", "ES", "FR", "DE"].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLanguage(l);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-white/10 ${
                    language === l ? "text-[#FF6B2C]" : "text-zinc-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Scanner Container */}
      <main className="relative z-10 max-w-md mx-auto w-full flex flex-col items-center gap-6 py-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Scan the QR code on your table
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            This will open the menu in your browser.
          </p>
        </div>

        {/* Viewfinder Frame (Tap to simulate scan) */}
        <div className="relative flex flex-col items-center">
          <div
            onClick={handleSimulateScan}
            className={`relative w-64 h-64 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl cursor-pointer group transition-all ${
              flashOn ? "ring-8 ring-amber-400/20" : ""
            }`}
          >
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF6B2C] to-transparent shadow-[0_0_15px_#FF6B2C] animate-[bounce_2s_infinite] top-1/2 -translate-y-1/2" />

            {/* Target Corner Guides */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[#FF6B2C] rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[#FF6B2C] rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[#FF6B2C] rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[#FF6B2C] rounded-br-xl" />

            {/* Center QR Code Graphic */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 p-3 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-16 h-16 text-white/80"
              >
                <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 12h2v-2h-2v2zm-2-2h2v-2h-2v2zm4 0h2v-2h-2v2zm0-4h2v-2h-2v2zm-4 0h2v-2h-2v2zm2-2h2v-2h-2v2zm2 6h2v-2h-2v2z" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="5" width="2" height="2" fill="currentColor"/>
                <rect x="5" y="17" width="2" height="2" fill="currentColor"/>
              </svg>
            </div>

            <span className="text-[11px] text-zinc-400 mt-3 font-semibold group-hover:text-[#FF6B2C] transition-colors">
              {isScanning ? "Scanning Table 05..." : "Tap to simulate camera scan"}
            </span>
          </div>

          {/* Flashlight Button */}
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`mt-4 w-11 h-11 rounded-full border flex items-center justify-center text-lg transition-all ${
              flashOn
                ? "bg-amber-400 text-zinc-900 border-amber-400 shadow-lg shadow-amber-400/40"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }`}
            title="Toggle Flashlight"
          >
            🔦
          </button>
        </div>

        {/* Manual Table Number Input Card */}
        <div className="w-full bg-white rounded-3xl p-5 text-[#121212] shadow-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
            <span>💡</span>
            <span>No camera? Enter table number manually</span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Table Number"
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-lg transition-all flex items-center justify-center shadow-lg shadow-[#FF6B2C]/30 active:scale-95"
            >
              →
            </button>
          </form>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs font-medium text-zinc-400 py-3">
        Good Food. Good People.
      </footer>
    </div>
  );
}
