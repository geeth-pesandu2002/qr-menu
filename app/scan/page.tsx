"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";
import { ThemeToggle } from "@/src/context/ThemeContext";
import { mockTables } from "@/src/mock/menuData";

export default function ScanPage() {
  const router = useRouter();
  const { setTable } = useCart();
  const [tableInput, setTableInput] = useState("05");
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSimulateScan = (tableIdToScan: string = "05") => {
    setIsScanning(true);
    setTimeout(() => {
      setTable(tableIdToScan, `Table ${tableIdToScan.padStart(2, "0")}`);
      router.push(`/t/${tableIdToScan}/welcome`);
    }, 700);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableInput.trim()) return;
    const cleanNumber = tableInput.trim().padStart(2, "0");
    setTable(cleanNumber, `Table ${cleanNumber}`);
    router.push(`/t/${cleanNumber}/welcome`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D0D0D] text-[#121212] dark:text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden select-none transition-colors">
      {/* Background Ambience with blur */}
      <div className="absolute inset-0 z-0 opacity-15 dark:opacity-30 pointer-events-none">
        <Image
          src="/hero-bg.jpg"
          alt="Cafe Ambience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF7F2]/60 to-[#FAF7F2] dark:from-[#0D0D0D]/70 dark:via-[#0D0D0D]/90 dark:to-[#0D0D0D]" />
      </div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#FF6B2C]/15 dark:bg-[#FF6B2C]/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[420px] h-[420px] rounded-full bg-[#E7A451]/15 dark:bg-[#E7A451]/20 blur-[150px] pointer-events-none" />

      {/* Top Header - Frosted Glass Bar */}
      <header className="relative z-10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 px-5 py-3 rounded-full flex justify-between items-center max-w-6xl mx-auto w-full shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white shadow-md shadow-[#FF6B2C]/30 text-lg">
            🍴
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#121212] dark:text-white">
            Dine<span className="text-[#FF6B2C]">Go</span>
          </span>
        </Link>

        {/* Right Header: Quick Demo Link & ThemeToggle & Language selector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/kitchen/login"
            className="hidden sm:inline-flex items-center gap-1.5 bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#121212] dark:text-zinc-200 border border-zinc-200/80 dark:border-white/15 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <span>👨‍🍳</span>
            <span>Kitchen</span>
          </Link>

          <button
            onClick={() => handleSimulateScan("05")}
            className="hidden sm:inline-flex items-center gap-2 bg-[#FF6B2C]/15 hover:bg-[#FF6B2C]/25 text-[#FF6B2C] border border-[#FF6B2C]/40 px-3.5 py-1.5 rounded-full text-xs font-black transition-all"
          >
            <span>⚡ Demo Table 05</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="text-xs font-bold bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#121212] dark:text-zinc-200 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <span>{language}</span>
              <span className="text-[10px]">▾</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-24 bg-white/95 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-xl z-30 backdrop-blur-xl">
                {["EN", "ES", "FR", "DE"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLanguage(l);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 ${
                      language === l ? "text-[#FF6B2C] font-bold" : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Scanner Container - Responsive Grid on Desktop */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column: Interactive QR Viewfinder */}
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#121212] dark:text-white tracking-tight">
                Scan the QR code on your table
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Point your camera at the QR stand or click the simulation below to open the digital menu.
              </p>
            </div>

            {/* Viewfinder Frame - Frosted Glass */}
            <div className="relative flex flex-col items-center">
              <div
                onClick={() => handleSimulateScan(tableInput || "05")}
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/80 dark:border-white/15 flex flex-col items-center justify-center overflow-hidden shadow-2xl cursor-pointer group transition-all ${
                  flashOn ? "ring-8 ring-amber-400/40" : ""
                }`}
              >
                {/* Laser Scanning Animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF6B2C] to-transparent shadow-[0_0_20px_#FF6B2C] animate-[bounce_2s_infinite] top-1/2 -translate-y-1/2" />

                {/* Target Guides */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[#FF6B2C] rounded-tl-xl" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[#FF6B2C] rounded-tr-xl" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[#FF6B2C] rounded-bl-xl" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[#FF6B2C] rounded-br-xl" />

                {/* Center QR Graphic */}
                <div className="w-28 h-28 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/20 p-3.5 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-20 h-20 text-[#121212]/80 dark:text-white/90"
                  >
                    <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 12h2v-2h-2v2zm-2-2h2v-2h-2v2zm4 0h2v-2h-2v2zm0-4h2v-2h-2v2zm-4 0h2v-2h-2v2zm2-2h2v-2h-2v2zm2 6h2v-2h-2v2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
                    <rect x="17" y="5" width="2" height="2" fill="currentColor"/>
                    <rect x="5" y="17" width="2" height="2" fill="currentColor"/>
                  </svg>
                </div>

                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 font-semibold group-hover:text-[#FF6B2C] transition-colors">
                  {isScanning ? `Scanning Table ${tableInput}...` : "Tap to simulate camera scan"}
                </span>
              </div>

              {/* Flashlight Button */}
              <button
                onClick={() => setFlashOn(!flashOn)}
                className={`mt-4 w-12 h-12 rounded-full border flex items-center justify-center text-xl transition-all shadow-md ${
                  flashOn
                    ? "bg-amber-400 text-zinc-900 border-amber-400 shadow-lg shadow-amber-400/40"
                    : "bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#121212] dark:text-white border-zinc-200 dark:border-white/20"
                }`}
                title="Toggle Flashlight"
              >
                🔦
              </button>
            </div>
          </div>

          {/* Right Column: Table Picker & Manual Input - Frosted Glass Card */}
          <div className="bg-white/80 dark:bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-[#121212] dark:text-white border border-white/80 dark:border-white/15 shadow-2xl space-y-6 transition-colors">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#121212] dark:text-white">
                Select Table or Enter Number
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Testing without a physical QR stand? Select any table below:
              </p>
            </div>

            {/* Quick Table Grid Picker */}
            <div className="grid grid-cols-4 gap-2.5">
              {mockTables.map((t) => {
                const isSelected = tableInput === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTableInput(t.id);
                      handleSimulateScan(t.id);
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? "bg-[#FF6B2C] text-white border-[#FF6B2C] shadow-md shadow-[#FF6B2C]/30 font-black scale-102"
                        : "bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-white/10 font-bold backdrop-blur-sm"
                    }`}
                  >
                    <span className="text-xs">🪑</span>
                    <span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Manual Form */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-white/10">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block">
                Enter Custom Table Number:
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="e.g. 05"
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  className="flex-1 bg-white/70 dark:bg-white/5 border border-zinc-200 dark:border-white/15 rounded-2xl px-4 py-3.5 text-sm font-bold text-[#121212] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF6B2C] focus:bg-white dark:focus:bg-white/10 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-black text-lg transition-all flex items-center justify-center shadow-lg shadow-[#FF6B2C]/30 active:scale-95"
                >
                  →
                </button>
              </form>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold border-t border-zinc-200/60 dark:border-white/10">
              <div>⚡ Instant Dispatch</div>
              <div>📱 Live Updates</div>
              <div>✨ No App Needed</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-3">
        Good Food. Good People. &bull; DineGo Digital QR Platform
      </footer>
    </div>
  );
}
