"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useKitchen, KitchenOrder } from "@/src/context/KitchenContext";

export default function KitchenDashboardPage() {
  const router = useRouter();
  const { kitchenOrders, updateOrderStatus, setActiveOrder, refreshKitchenOrders } = useKitchen();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshKitchenOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const newOrders = kitchenOrders.filter((o) => o.status === "RECEIVED");
  const preparingOrders = kitchenOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = kitchenOrders.filter((o) => o.status === "SERVED");
  const completedOrders = kitchenOrders.filter((o) => o.status === "COMPLETED");

  const handleCardClick = (order: KitchenOrder) => {
    setActiveOrder(order);
    router.push(`/kitchen/orders/${order.id}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-[#121212] flex items-center gap-2">
            <span>Kitchen Order Management</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Live orders directly synced with diner table orders & backend API
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60"
        >
          <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
          <span>{isRefreshing ? "Syncing..." : "Sync Orders"}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
              🕒
            </div>
            <div>
              <p className="text-2xl font-black text-[#121212]" suppressHydrationWarning>{newOrders.length}</p>
              <p className="text-xs text-zinc-500 font-semibold">New Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">
              🍳
            </div>
            <div>
              <p className="text-2xl font-black text-[#121212]" suppressHydrationWarning>{preparingOrders.length}</p>
              <p className="text-xs text-zinc-500 font-semibold">Preparing</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <p className="text-2xl font-black text-[#121212]" suppressHydrationWarning>{readyOrders.length}</p>
              <p className="text-xs text-zinc-500 font-semibold">Ready to Serve</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center text-xl font-bold">
              📊
            </div>
            <div>
              <p className="text-2xl font-black text-[#121212]" suppressHydrationWarning>
                {kitchenOrders.length + completedOrders.length}
              </p>
              <p className="text-xs text-zinc-500 font-semibold">Total Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: New Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
              <span>New Orders</span>
              <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full" suppressHydrationWarning>
                {newOrders.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-zinc-300 text-zinc-400 text-xs font-semibold">
                No new orders awaiting preparation
              </div>
            ) : (
              newOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleCardClick(order)}
                  className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-2.5">
                    <div>
                      <h3 className="font-extrabold text-base text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
                        {order.tableLabel}
                      </h3>
                      <span className="text-xs font-semibold text-zinc-400">
                        #{order.id}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                      {order.elapsedMinutes || 2} mins ago
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-700">
                    {order.lines.map((line, i) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span>{line.name}</span>
                        {line.note && (
                          <span className="text-amber-700 italic text-[11px] truncate max-w-[120px]">
                            ({line.note})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, "PREPARING");
                        router.push(`/kitchen/orders/${order.id}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-xs transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center justify-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>Start Preparing</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#F4B400] uppercase tracking-wider flex items-center gap-2">
              <span>Preparing</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full" suppressHydrationWarning>
                {preparingOrders.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-zinc-300 text-zinc-400 text-xs font-semibold">
                No orders currently in preparation
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleCardClick(order)}
                  className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-2.5">
                    <div>
                      <h3 className="font-extrabold text-base text-[#121212] group-hover:text-[#F4B400] transition-colors">
                        {order.tableLabel}
                      </h3>
                      <span className="text-xs font-semibold text-zinc-400">
                        #{order.id}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {order.elapsedMinutes || 6} mins ago
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-700">
                    {order.lines.map((line, i) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span>{line.name}</span>
                        {line.note && (
                          <span className="text-amber-700 italic text-[11px] truncate max-w-[120px]">
                            ({line.note})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, "SERVED");
                        router.push(`/kitchen/orders/${order.id}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#F4B400] hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
                    >
                      <span>📁</span>
                      <span>Mark as Ready</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready to Serve */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#198754] uppercase tracking-wider flex items-center gap-2">
              <span>Ready to Serve</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full" suppressHydrationWarning>
                {readyOrders.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-zinc-300 text-zinc-400 text-xs font-semibold">
                No ready orders waiting to be served
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleCardClick(order)}
                  className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-2.5">
                    <div>
                      <h3 className="font-extrabold text-base text-[#121212] group-hover:text-[#198754] transition-colors">
                        {order.tableLabel}
                      </h3>
                      <span className="text-xs font-semibold text-zinc-400">
                        #{order.id}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {order.elapsedMinutes || 12} mins ago
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-700">
                    {order.lines.map((line, i) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span>{line.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, "COMPLETED");
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#198754] hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <span>✓</span>
                      <span>Mark as Served</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

