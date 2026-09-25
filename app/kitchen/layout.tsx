"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KitchenProvider, useKitchen } from "@/src/context/KitchenContext";

function KitchenLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useKitchen();

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " | " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // If on login page, render children directly without sidebar
  if (pathname === "/kitchen/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex font-sans">
      {/* Dark Sidebar */}
      <aside className="w-64 bg-[#121212] text-white flex flex-col justify-between p-4 flex-shrink-0 border-r border-zinc-800">
        <div className="space-y-8">
          {/* Brand Logo */}
          <Link href="/kitchen/dashboard" className="flex items-center gap-2.5 px-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-lg shadow-md shadow-[#FF6B2C]/30">
              🍳
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Dine<span className="text-[#FF6B2C]">Go</span>
              </span>
              <span className="text-[10px] block font-semibold text-zinc-400 -mt-1">
                Kitchen Portal
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-sm font-semibold">
            <Link
              href="/kitchen/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/kitchen/dashboard" || pathname.startsWith("/kitchen/orders")
                  ? "bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/20 font-bold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>📋</span>
              <span>Live Orders</span>
            </Link>

            <Link
              href="/kitchen/history"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/kitchen/history"
                  ? "bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/20 font-bold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>📜</span>
              <span>Order History</span>
            </Link>

            <button
              onClick={() => alert("Kitchen Settings: Display preferences & printer configuration.")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            router.push("/kitchen/login");
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-semibold transition-all"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#121212]">Live Orders</h1>
            <p className="text-xs text-zinc-500 font-medium">
              Real-time orders from diners
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>
            <span className="text-zinc-500 bg-zinc-100 px-3.5 py-1.5 rounded-full font-mono">
              {currentTime || "Mon, 12 May 2025 | 12:24 PM"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <KitchenProvider>
      <KitchenLayoutContent>{children}</KitchenLayoutContent>
    </KitchenProvider>
  );
}
