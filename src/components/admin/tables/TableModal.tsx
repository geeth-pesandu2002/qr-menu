"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/src/lib/types";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: Partial<Table>) => void;
  table?: Table | null;
}

export default function TableModal({
  isOpen,
  onClose,
  onSave,
  table,
}: TableModalProps) {
  const [label, setLabel] = useState("");
  const [seats, setSeats] = useState<number | string>(4);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      setLabel(table.label);
      setSeats(table.seats ?? 4);
      setIsActive(table.isActive ?? true);
    } else {
      setLabel("");
      setSeats(4);
      setIsActive(true);
    }
    setError(null);
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError("Please enter a table label.");
      return;
    }

    const numSeats = Number(seats);
    if (isNaN(numSeats) || numSeats < 1) {
      setError("Seats must be at least 1.");
      return;
    }

    onSave({
      ...(table ? { id: table.id } : {}),
      label: label.trim(),
      seats: numSeats,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪑</span>
              <h2 className="text-lg font-black text-[#121212]">
                {table ? "Edit Dining Table" : "Add New Table"}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {table
                ? "Update seating capacity and table status"
                : "Configure a new dining table in your venue"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Table Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Table Label <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Table 01, Patio 04, VIP Booth"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Seats Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Number of Seats <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
            />
          </div>

          {/* Active / Inactive Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <div>
              <p className="text-xs font-bold text-[#121212]">Table Status</p>
              <p className="text-[11px] text-zinc-500">
                {isActive
                  ? "Active • Diners can scan and place orders"
                  : "Inactive • QR code ordering is disabled"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-[#198754]" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Read-only QR Information in Edit Mode */}
          {table && (table.qrToken || table.qrUrl) && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-zinc-200/80 space-y-1 text-xs">
              <span className="font-bold text-zinc-600 block text-[11px] uppercase tracking-wider">
                Assigned QR Access Details (Read-only)
              </span>
              {table.qrToken && (
                <div className="flex justify-between text-zinc-600">
                  <span className="text-zinc-400">Token:</span>
                  <span className="font-mono font-bold text-zinc-800">{table.qrToken}</span>
                </div>
              )}
              {table.qrUrl && (
                <div className="flex justify-between text-zinc-600">
                  <span className="text-zinc-400">Target Route:</span>
                  <span className="font-mono text-zinc-700 text-[11px] truncate max-w-[200px]">{table.qrUrl}</span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/25"
            >
              {table ? "Save Changes" : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
