"use client";

import React, { useState } from "react";
import { Table } from "@/src/lib/types";

interface QRCodeModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({
  table,
  isOpen,
  onClose,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const fullUrl = table.qrUrl?.startsWith("http")
    ? table.qrUrl
    : `https://dinego.app${table.qrUrl || `/t/${table.id}`}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B2C] flex items-center justify-center text-base">
              🪑
            </div>
            <div>
              <h3 className="font-black text-base text-[#121212]">
                {table.label}
              </h3>
              <span className="text-[11px] text-zinc-400 font-medium">
                Customer QR Access Code
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* QR Display Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#FAF7F2] rounded-2xl border border-zinc-200/80 space-y-3">
          {/* Demo QR Graphic */}
          <div className="relative w-44 h-44 bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center justify-center">
            {/* SVG Geometric QR Mockup */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-zinc-800"
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
              <rect x="38" y="10" width="8" height="8" rx="1" />
              <rect x="52" y="14" width="8" height="8" rx="1" />
              <rect x="42" y="24" width="8" height="8" rx="1" />
              <rect x="12" y="40" width="8" height="8" rx="1" />
              <rect x="26" y="44" width="8" height="8" rx="1" />
              <rect x="40" y="40" width="16" height="16" rx="3" fill="#FF6B2C" />
              <rect x="64" y="38" width="8" height="8" rx="1" />
              <rect x="78" y="44" width="8" height="8" rx="1" />
              <rect x="38" y="66" width="8" height="8" rx="1" />
              <rect x="52" y="72" width="8" height="8" rx="1" />
              <rect x="68" y="64" width="8" height="8" rx="1" />
              <rect x="78" y="76" width="8" height="8" rx="1" />
              <rect x="62" y="82" width="8" height="8" rx="1" />
            </svg>

            {/* Demo QR Watermark Badge */}
            <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-zinc-900/90 text-white text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              Demo QR
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-xs font-bold text-zinc-800">
              Scan to open digital menu
            </span>
            <p className="text-[11px] text-zinc-400">
              {table.seats ? `${table.seats} Seats` : "Standard Dining Table"}
            </p>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs">
          {table.qrToken && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-400 font-semibold">QR Token:</span>
              <span className="font-mono font-bold text-zinc-800">
                {table.qrToken}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-400 font-semibold truncate pr-2">Link:</span>
            <span className="font-mono text-zinc-600 text-[11px] truncate">
              {table.qrUrl || `/t/${table.id}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>{copied ? "Copied!" : "Copy URL"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-xl bg-[#121212] hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
