"use client";

import React from "react";
import { Table } from "@/src/lib/types";

interface TableCardProps {
  table: Table;
  onViewQR: (table: Table) => void;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onToggleStatus: (tableId: string) => void;
}

export default function TableCard({
  table,
  onViewQR,
  onEdit,
  onDelete,
  onToggleStatus,
}: TableCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-3 bg-zinc-50/50">
        <div>
          <h3 className="font-black text-lg text-[#121212] group-hover:text-[#FF6B2C] transition-colors">
            {table.label}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-semibold mt-0.5">
            <span>👥</span>
            <span>{table.seats || 4} Seats</span>
          </span>
        </div>

        {/* Status Toggle Badge (Strictly Active or Inactive) */}
        <button
          type="button"
          onClick={() => onToggleStatus(table.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
            table.isActive
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
          }`}
          title="Click to toggle status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              table.isActive ? "bg-[#198754]" : "bg-zinc-400"
            }`}
          />
          <span>{table.isActive ? "Active" : "Inactive"}</span>
        </button>
      </div>

      {/* QR Preview Area */}
      <div className="p-6 flex flex-col items-center justify-center bg-white space-y-3">
        {/* QR Code Container */}
        <div
          onClick={() => onViewQR(table)}
          className="relative w-36 h-36 bg-[#FAF7F2] p-3 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center cursor-pointer group-hover:border-[#FF6B2C]/40 group-hover:shadow-md transition-all"
          title="Click to view QR details"
        >
          {/* SVG Geometric QR Mockup */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity"
            fill="currentColor"
          >
            {/* Corner position markers */}
            <rect x="5" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
            <rect x="11" y="11" width="14" height="14" rx="2" />

            <rect x="69" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
            <rect x="75" y="11" width="14" height="14" rx="2" />

            <rect x="5" y="69" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
            <rect x="11" y="75" width="14" height="14" rx="2" />

            {/* Data blocks */}
            <rect x="38" y="12" width="8" height="8" rx="1" />
            <rect x="52" y="14" width="8" height="8" rx="1" />
            <rect x="42" y="26" width="8" height="8" rx="1" />
            <rect x="12" y="40" width="8" height="8" rx="1" />
            <rect x="26" y="44" width="8" height="8" rx="1" />
            <rect x="42" y="42" width="14" height="14" rx="2" fill="#FF6B2C" />
            <rect x="64" y="38" width="8" height="8" rx="1" />
            <rect x="78" y="44" width="8" height="8" rx="1" />
            <rect x="38" y="66" width="8" height="8" rx="1" />
            <rect x="52" y="72" width="8" height="8" rx="1" />
            <rect x="68" y="64" width="8" height="8" rx="1" />
            <rect x="78" y="76" width="8" height="8" rx="1" />
          </svg>

          {/* Demo QR Watermark Tag */}
          <span className="absolute bottom-1 px-1.5 py-0.5 rounded-full bg-zinc-900/90 text-white text-[8px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
            Demo QR
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewQR(table)}
          className="text-xs font-bold text-[#FF6B2C] hover:text-[#E55A1F] hover:underline flex items-center gap-1 transition-colors"
        >
          <span>🔍</span>
          <span>View QR Code</span>
        </button>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 border-t border-zinc-100 bg-[#FAF7F2]/60 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-zinc-400 font-semibold truncate max-w-[120px]">
          {table.qrToken || table.id}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(table)}
            className="p-2 rounded-xl text-zinc-500 hover:text-[#FF6B2C] hover:bg-[#FF6B2C]/10 transition-colors"
            title="Edit Table"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(table)}
            className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Table"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
