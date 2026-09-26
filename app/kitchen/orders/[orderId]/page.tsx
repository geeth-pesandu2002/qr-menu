"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useKitchen, KitchenOrder } from "@/src/context/KitchenContext";
import { formatPrice, OrderStatus, OrderLine } from "@/src/lib/types";

const DEFAULT_FALLBACK_ORDER = {
  id: "1001",
  tableId: "05",
  tableLabel: "Table 05",
  sessionId: "s1001",
  status: "RECEIVED" as OrderStatus,
  lines: [
    {
      itemId: "b1",
      name: "1 x Chicken Burger",
      variantLabel: null,
      unitPrice: 1200,
      qty: 1,
      note: "No onions, extra cheese",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
    },
    {
      itemId: "d1",
      name: "1 x Coke",
      variantLabel: null,
      unitPrice: 300,
      qty: 1,
      note: "",
      imageUrl:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80",
    },
    {
      itemId: "f1",
      name: "1 x Fries",
      variantLabel: null,
      unitPrice: 500,
      qty: 1,
      note: "Extra crispy",
      imageUrl:
        "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&auto=format&fit=crop&q=80",
    },
  ],
  subtotal: 2000,
  serviceCharge: 100,
  total: 2000,
  createdAt: 1720780000000,
  updatedAt: 1720780000000,
  elapsedMinutes: 2,
};

export default function KitchenOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const { kitchenOrders, updateOrderStatus } = useKitchen();
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [apiOrder, setApiOrder] = useState<KitchenOrder | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setApiOrder({
              ...json.data,
              elapsedMinutes: Math.max(
                1,
                Math.round((Date.now() - json.data.createdAt) / 60000)
              ),
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch order from API:", err);
      }
    }
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const activeKitchenOrder = kitchenOrders.find((o) => o.id === orderId);
  const order =
    apiOrder ||
    activeKitchenOrder || {
      ...DEFAULT_FALLBACK_ORDER,
      id: orderId,
    };

  const isNew = order.status === "RECEIVED";
  const isPreparing = order.status === "PREPARING";
  const isServed = order.status === "SERVED";
  const isCompleted = order.status === "COMPLETED";

  const handleNextStatus = () => {
    let nextStatus: OrderStatus | null = null;
    if (isNew) nextStatus = "PREPARING";
    else if (isPreparing) nextStatus = "SERVED";
    else if (isServed) nextStatus = "COMPLETED";

    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
      if (apiOrder) {
        setApiOrder({ ...apiOrder, status: nextStatus, updatedAt: Date.now() });
      }
    }
  };

  const getNextActionText = () => {
    if (isNew) return "Start Preparing";
    if (isPreparing) return "Mark as Ready";
    if (isServed) return "Mark as Served";
    return "Completed";
  };

  const totalItemsCount = order.lines.reduce(
    (acc: number, l: OrderLine) => acc + l.qty,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link
          href="/kitchen/dashboard"
          className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#FF6B2C]"
        >
          <span>←</span>
          <span>Back to Live Orders</span>
        </Link>
        <div className="text-right">
          <span className="text-xs text-zinc-400 font-semibold block">Order Time</span>
          <span className="text-xs font-bold text-zinc-700" suppressHydrationWarning>
            12:22 PM ({order.elapsedMinutes || 2} mins ago)
          </span>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#121212]">{order.tableLabel}</h1>
            <span className="text-xs font-bold text-zinc-400">#{order.id}</span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                isNew
                  ? "bg-red-100 text-red-700"
                  : isPreparing
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isNew ? "New Order" : isPreparing ? "Preparing" : isServed ? "Ready to Serve" : "Completed"}
            </span>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <span>🖨️</span>
            <span>Print Ticket</span>
          </button>
        </div>

        {/* Item Breakdown List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Order Items ({totalItemsCount})
          </h2>

          <div className="space-y-3 divide-y divide-zinc-100">
            {order.lines.map((line: OrderLine, idx: number) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {line.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg flex-shrink-0 font-bold">
                      🍴
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-sm text-[#121212]">{line.name}</h3>
                    {line.note && (
                      <p className="text-xs text-amber-800 font-medium italic mt-0.5">
                        Note: &quot;{line.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-[#121212]">
                    {formatPrice(line.unitPrice * line.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-zinc-100 font-extrabold text-sm">
            <span>Total Items</span>
            <span className="text-[#FF6B2C]">{totalItemsCount}</span>
          </div>
        </div>

        {/* Interactive Progress Bar Stepper */}
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-zinc-200/80 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Preparation Progress Timeline
          </h3>

          <div className="relative flex items-center justify-between px-4 py-2">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-zinc-200" />
            <div
              className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-[#FF6B2C] transition-all duration-300"
              style={{
                width: isNew ? "0%" : isPreparing ? "33%" : isServed ? "66%" : "100%",
              }}
            />

            {/* Step 1: Received */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-[#06402B] text-white font-bold text-xs flex items-center justify-center shadow-md">
                ✓
              </div>
              <span className="text-[11px] font-bold text-[#121212]">Received</span>
              <span className="text-[10px] text-zinc-400">12:16 PM</span>
            </div>

            {/* Step 2: Preparing */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md transition-colors ${
                  isPreparing || isServed || isCompleted
                    ? "bg-[#F4B400] text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                🍳
              </div>
              <span className="text-[11px] font-bold text-[#121212]">Preparing</span>
              <span className="text-[10px] text-zinc-400">12:20 PM</span>
            </div>

            {/* Step 3: Ready */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md transition-colors ${
                  isServed || isCompleted
                    ? "bg-[#198754] text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                ⚡
              </div>
              <span className="text-[11px] font-bold text-[#121212]">Ready</span>
            </div>

            {/* Step 4: Served */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md transition-colors ${
                  isCompleted ? "bg-[#198754] text-white" : "bg-zinc-200 text-zinc-500"
                }`}
              >
                🎉
              </div>
              <span className="text-[11px] font-bold text-[#121212]">Served</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-2">
          <Link
            href="/kitchen/dashboard"
            className="flex-1 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm text-center transition-all"
          >
            ← Back
          </Link>
          <button
            disabled={isCompleted}
            onClick={handleNextStatus}
            className={`flex-2 py-3.5 rounded-full font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              isCompleted
                ? "bg-zinc-300 cursor-not-allowed opacity-60"
                : isNew
                ? "bg-[#FF6B2C] hover:bg-[#E55A1F] shadow-[#FF6B2C]/30"
                : isPreparing
                ? "bg-[#F4B400] hover:bg-amber-500 shadow-amber-400/30"
                : "bg-[#198754] hover:bg-emerald-700 shadow-emerald-600/30"
            }`}
          >
            <span>▶</span>
            <span>{getNextActionText()}</span>
          </button>
        </div>
      </div>

      {/* Printable Ticket Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl space-y-4 text-center font-mono">
            <div className="border-b border-dashed border-zinc-400 pb-3">
              <h3 className="font-black text-lg text-black">*** KITCHEN TICKET ***</h3>
              <p className="text-xs text-zinc-600">{order.tableLabel} • ORDER #{order.id}</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-left text-xs space-y-2 py-2">
              {order.lines.map((l: OrderLine, i: number) => (
                <div key={i} className="flex justify-between font-bold">
                  <span>{l.name}</span>
                  <span>x{l.qty}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-zinc-400 pt-3 flex justify-between text-xs font-bold">
              <span>TOTAL ITEMS:</span>
              <span>{totalItemsCount}</span>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="w-full py-3 rounded-full bg-[#121212] text-white font-bold text-xs"
              >
                🖨️ Print Ticket
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-full py-2 text-zinc-500 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
