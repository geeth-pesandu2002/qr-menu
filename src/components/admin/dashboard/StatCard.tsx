import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: "orange" | "green" | "gold" | "zinc" | "red";
}

const ACCENT_STYLES = {
  orange: {
    iconBg: "bg-[#FF6B2C]/10 text-[#FF6B2C]",
    borderHover: "hover:border-[#FF6B2C]/40",
  },
  green: {
    iconBg: "bg-emerald-50 text-[#198754]",
    borderHover: "hover:border-emerald-300",
  },
  gold: {
    iconBg: "bg-amber-50 text-[#F4B400]",
    borderHover: "hover:border-amber-300",
  },
  zinc: {
    iconBg: "bg-zinc-100 text-zinc-700",
    borderHover: "hover:border-zinc-300",
  },
  red: {
    iconBg: "bg-rose-50 text-[#DC3545]",
    borderHover: "hover:border-rose-300",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "orange",
}: StatCardProps) {
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.orange;

  return (
    <div
      className={`bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all ${accent.borderHover} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#121212] tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${accent.iconBg}`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-zinc-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold inline-flex items-center gap-0.5 ${
                trend.isPositive ? "text-emerald-600" : "text-zinc-500"
              }`}
            >
              {trend.isPositive ? "↑" : "•"} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
