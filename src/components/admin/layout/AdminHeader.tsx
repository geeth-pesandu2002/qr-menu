"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "Executive Dashboard",
    subtitle: "Real-time revenue, orders & restaurant performance",
  },
  "/admin/orders": {
    title: "Live Orders Management",
    subtitle: "Monitor real-time kitchen operations, track customer tickets, and update order statuses",
  },
  "/admin/menu": {
    title: "Menu Items Management",
    subtitle: "Manage dishes, pricing, variants, and customer availability",
  },
  "/admin/menu/new": {
    title: "Add New Menu Item",
    subtitle: "Configure a new dish for your digital restaurant catalog",
  },
  "/admin/categories": {
    title: "Categories Management",
    subtitle: "Organize dishes into customer menu sections and control section visibility",
  },
  "/admin/tables": {
    title: "Tables Management",
    subtitle: "Configure dining tables, seat capacities, and customer QR access tokens",
  },
  "/admin/reports": {
    title: "Reports & Analytics",
    subtitle: "Comprehensive revenue breakdown, order volume analytics, and top performing dishes",
  },
  "/admin/settings": {
    title: "System Settings",
    subtitle: "Manage restaurant profile, ordering preferences, service charges, and account details",
  },
};

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }) +
          " • " +
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

  // Resolve title mapping including dynamic nested edit routes
  const getHeaderInfo = () => {
    if (TITLE_MAP[pathname]) {
      return TITLE_MAP[pathname];
    }
    if (pathname.startsWith("/admin/menu/") && pathname.endsWith("/edit")) {
      return {
        title: "Edit Menu Item",
        subtitle: "Modify dish title, description, base pricing, portions, and availability status",
      };
    }
    return {
      title: "Restaurant Owner Portal",
      subtitle: "DineGo Operations Management",
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#121212] tracking-tight">
            {headerInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-zinc-500 font-medium">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold">
        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Operations</span>
        </div>

        {/* Live Clock */}
        <span className="hidden sm:inline-block text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full font-mono text-[11px]">
          {currentTime || "Live"}
        </span>

        {/* Quick Portal Switcher */}
        <Link
          href="/t/05"
          target="_blank"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
          title="Open customer menu preview"
        >
          <span>📱</span>
          <span>Diner View</span>
        </Link>

        {/* Owner Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            TC
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-extrabold text-[#121212] leading-none">
              The Cozy Cafe
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold">
              Owner Mode
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
