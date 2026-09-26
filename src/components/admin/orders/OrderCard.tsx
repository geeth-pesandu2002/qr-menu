"use client";

import React from "react";
import { Order, OrderStatus, formatPrice } from "@/src/lib/types";
import OrderStatusBadge from "@/src/components/admin/orders/OrderStatusBadge";

interface OrderCardProps {
  order: Order;
  onStatusTransition: (orderId: string, nextStatus: OrderStatus) => void;
}

export default function OrderCard({
  order,
  onStatusTransition,
}: OrderCardProps) {
  const elapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - order.createdAt) / (1000 * 60))
  );

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-3 bg-zinc-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-black text-lg text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
              #{order.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-800 shadow-xs">
              {order.tableLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-1 flex items-center gap-1.5">
            <span>🕒 {formattedTime}</span>
            <span>•</span>
            <span className="text-zinc-600 font-semibold">{elapsedMinutes}m ago</span>
          </p>
        </div>

        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* Order Lines Item List */}
      <div className="p-5 flex-1 space-y-3">
        <div className="space-y-2.5">
          {order.lines.map((line, idx) => (
            <div
              key={line.id || `${line.itemId}-${idx}`}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#FF6B2C]/10 text-[#FF6B2C] font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                    {line.qty}x
                  </span>
                  <span className="font-bold text-zinc-900 truncate">
                    {line.name}
                  </span>
                  {line.variantLabel && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200/70">
                      {line.variantLabel}
                    </span>
                  )}
                </div>

                {line.note && (
                  <p className="text-[11px] text-amber-800 italic mt-0.5 pl-7">
                    Note: &quot;{line.note}&quot;
                  </p>
                )}
              </div>

              <span className="font-bold text-zinc-700 whitespace-nowrap">
                {formatPrice((line.lineTotal ?? line.unitPrice * line.qty))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary & Actions Bottom Bar */}
      <div className="p-5 border-t border-zinc-100 bg-[#FAF7F2]/50 space-y-3">
        {/* Price Breakdown */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-semibold">
            {order.lines.reduce((acc, l) => acc + l.qty, 0)} total items
          </span>
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block font-medium">Total Bill</span>
            <span className="text-base font-black text-[#121212]">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Action Buttons based on Order Status */}
        <div className="pt-1">
          {order.status === "RECEIVED" && (
            <button
              type="button"
              onClick={() => onStatusTransition(order.id, "PREPARING")}
              className="w-full py-3 px-4 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center justify-center gap-1.5"
            >
              <span>🍳</span>
              <span>Start Preparing</span>
            </button>
          )}

          {order.status === "PREPARING" && (
            <button
              type="button"
              onClick={() => onStatusTransition(order.id, "SERVED")}
              className="w-full py-3 px-4 rounded-xl bg-[#198754] hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <span>🍽️</span>
              <span>Mark Served</span>
            </button>
          )}

          {order.status === "SERVED" && (
            <button
              type="button"
              onClick={() => onStatusTransition(order.id, "COMPLETED")}
              className="w-full py-3 px-4 rounded-xl bg-[#121212] hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md shadow-zinc-800/20 flex items-center justify-center gap-1.5"
            >
              <span>✓</span>
              <span>Complete Order</span>
            </button>
          )}

          {order.status === "COMPLETED" && (
            <div className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-bold text-center border border-zinc-200/80">
              ✓ Order Fulfilled & Closed
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold text-center border border-rose-200">
              ✕ Order Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
