import React from "react";
import { OrderStatus } from "@/src/lib/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  RECEIVED: {
    label: "Received",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  PREPARING: {
    label: "Preparing",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-[#F4B400]",
    border: "border-amber-200",
  },
  SERVED: {
    label: "Served",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-[#198754]",
    border: "border-emerald-200",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    dot: "bg-zinc-500",
    border: "border-zinc-200",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
};

export default function OrderStatusBadge({
  status,
  size = "md",
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
