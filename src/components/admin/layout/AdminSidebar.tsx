"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
    exact: true,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "📋",
    badge: "Live",
  },
  {
    label: "Menu",
    href: "/admin/menu",
    icon: "🍴",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "🏷️",
  },
  {
    label: "Tables",
    href: "/admin/tables",
    icon: "🪑",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "📈",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default function AdminSidebar({
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem("dinego_admin_token");
      localStorage.removeItem("dinego_admin_user");
      document.cookie = "dinego_owner_session=; path=/; max-age=0";
    } catch (err) {
      console.warn("Logout error:", err);
    }
    router.push("/admin/login");
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 font-sans">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link
          href="/admin/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-2.5 px-2 pt-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-lg shadow-md shadow-[#FF6B2C]/30 flex-shrink-0">
            🍽️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">
                Dine<span className="text-[#FF6B2C]">Go</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-[#FF6B2C]/20 text-[#FF6B2C] border border-[#FF6B2C]/30">
                Admin
              </span>
            </div>
            <span className="text-[10px] block font-semibold text-zinc-400">
              The Cozy Cafe • Owner
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1 text-sm font-semibold pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/25 font-bold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Restaurant Info & Logout */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <p className="font-bold text-white truncate">Restaurant Owner</p>
          <p className="text-zinc-400 text-[11px] truncate">owner@cozycafe.com</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-semibold transition-all text-left"
        >
          <span className="text-base">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#121212] text-white flex-col flex-shrink-0 border-r border-zinc-800 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        >
          <div
            className="w-64 bg-[#121212] text-white h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
