"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/src/lib/types";
import { adminFetch } from "@/src/lib/admin-api";

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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const loadQr = async () => {
    if (!table) return;
    setIsLoadingQr(true);
    setQrError(null);
    try {
      const json = await adminFetch(`/backend-api/qr-code?tableId=${table.id}`);
      if (json?.success && json.data?.dataUrl) {
        setQrDataUrl(json.data.dataUrl);
      } else {
        setQrError("Failed to generate QR code from server");
      }
    } catch (e: any) {
      console.error("Could not load real QR code:", e);
      setQrError(e?.message || "QR code generation failed");
    } finally {
      setIsLoadingQr(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !table) return;
    loadQr();
  }, [isOpen, table]);

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
          {/* QR Graphic */}
          <div className="relative w-44 h-44 bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center justify-center">
            {isLoadingQr ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#FF6B2C] border-t-transparent animate-spin" />
                <span className="text-[10px] text-zinc-400 font-bold">Generating QR...</span>
              </div>
            ) : qrError ? (
              <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                <span className="text-2xl">⚠️</span>
                <p className="text-[11px] font-bold text-rose-600">QR Code Unavailable</p>
                <p className="text-[10px] text-zinc-400 max-w-[130px] line-clamp-2">{qrError}</p>
                <button
                  type="button"
                  onClick={loadQr}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`${table.label} Live QR Code`}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : null}

            {/* Live QR Badge */}
            {!isLoadingQr && !qrError && qrDataUrl && (
              <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-zinc-900/90 text-white text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                Live QR
              </span>
            )}
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
