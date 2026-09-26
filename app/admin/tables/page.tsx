"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table } from "@/src/lib/types";
import TableCard from "@/src/components/admin/tables/TableCard";
import TableModal from "@/src/components/admin/tables/TableModal";
import QRCodeModal from "@/src/components/admin/tables/QRCodeModal";

const INITIAL_MOCK_TABLES: Table[] = [
  {
    id: "t1",
    label: "Table 01",
    seats: 2,
    isActive: true,
    qrToken: "TB01_QR_LIVE",
    qrUrl: "/t/01",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t2",
    label: "Table 02",
    seats: 4,
    isActive: true,
    qrToken: "TB02_QR_LIVE",
    qrUrl: "/t/02",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t3",
    label: "Table 03",
    seats: 4,
    isActive: true,
    qrToken: "TB03_QR_LIVE",
    qrUrl: "/t/03",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t4",
    label: "Table 04",
    seats: 6,
    isActive: true,
    qrToken: "TB04_QR_LIVE",
    qrUrl: "/t/04",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t5",
    label: "Table 05",
    seats: 4,
    isActive: true,
    qrToken: "TB05_QR_LIVE",
    qrUrl: "/t/05",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t6",
    label: "Table 06",
    seats: 8,
    isActive: true,
    qrToken: "TB06_QR_LIVE",
    qrUrl: "/t/06",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t7",
    label: "Table 07",
    seats: 2,
    isActive: true,
    qrToken: "TB07_QR_LIVE",
    qrUrl: "/t/07",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "t8",
    label: "Table 08",
    seats: 4,
    isActive: false, // Inactive demonstration
    qrToken: "TB08_QR_LIVE",
    qrUrl: "/t/08",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
];

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_MOCK_TABLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal states
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // Live tables loading from backend
  useEffect(() => {
    let isMounted = true;
    async function loadTables() {
      try {
        const res = await fetch("/api/tables");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setTables(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live tables:", err);
      }
    }
    loadTables();
    return () => {
      isMounted = false;
    };
  }, []);

  // Summary Metrics
  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.isActive).length;
  const inactiveTables = tables.filter((t) => !t.isActive).length;
  const qrReadyCount = tables.filter((t) => Boolean(t.qrToken || t.qrUrl)).length;

  // Status toggle handler with backend sync
  const handleToggleStatus = async (tableId: string) => {
    let newStatus = true;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          newStatus = !t.isActive;
          return { ...t, isActive: newStatus, updatedAt: Date.now() };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/tables/${tableId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer owner-token",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update table status on server:", err);
    }
  };

  // Add / Edit Table Save with backend sync
  const handleSaveTable = async (data: Partial<Table>) => {
    if (editingTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? { ...t, ...data, updatedAt: Date.now() }
            : t
        )
      );

      try {
        await fetch(`/api/tables/${editingTable.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer owner-token",
          },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("Failed to update table on server:", err);
      }
    } else {
      const newNum = tables.length + 1;
      const cleanNum = newNum < 10 ? `0${newNum}` : `${newNum}`;
      const newTable: Table = {
        id: `t${newNum}`,
        label: data.label || `Table ${cleanNum}`,
        seats: data.seats || 4,
        isActive: data.isActive ?? true,
        qrToken: `TB${cleanNum}_QR_DEMO`,
        qrUrl: `/t/${cleanNum}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTables((prev) => [...prev, newTable]);

      try {
        await fetch("/api/tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer owner-token",
          },
          body: JSON.stringify(newTable),
        });
      } catch (err) {
        console.warn("Failed to create table on server:", err);
      }
    }
    setEditingTable(null);
  };

  // Delete Table with backend sync
  const confirmDelete = async () => {
    if (!tableToDelete) return;
    const tId = tableToDelete.id;
    setTables((prev) => prev.filter((t) => t.id !== tId));
    setTableToDelete(null);

    try {
      await fetch(`/api/tables/${tId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer owner-token",
        },
      });
    } catch (err) {
      console.warn("Failed to delete table on server:", err);
    }
  };

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.qrToken && table.qrToken.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? table.isActive
        : !table.isActive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🪑</span>
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">
              Tables Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Configure dining tables, seat capacities, and customer QR access tokens
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditingTable(null);
              setIsTableModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B2C]/20 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add Table</span>
          </button>
          <button
            type="button"
            onClick={() => setTables(INITIAL_MOCK_TABLES)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Reset tables demo"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tables */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Tables
            </p>
            <p className="text-3xl font-black text-[#121212]">{totalTables}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Physical stations</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B2C] flex items-center justify-center text-xl font-bold flex-shrink-0">
            🪑
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Active Tables
            </p>
            <p className="text-3xl font-black text-[#121212]">{activeTables}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Open for guest ordering</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#198754] flex items-center justify-center text-xl font-bold flex-shrink-0">
            ✓
          </div>
        </div>

        {/* Inactive Tables */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Inactive Tables
            </p>
            <p className="text-3xl font-black text-[#121212]">{inactiveTables}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Temporarily disabled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
            ⏸️
          </div>
        </div>

        {/* QR Ready */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              QR Ready
            </p>
            <p className="text-3xl font-black text-[#121212]">{qrReadyCount}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Codes configured</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
            📱
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables by label or QR token..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs text-[#121212] placeholder-zinc-400 focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-semibold hidden sm:inline">Status:</span>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => {
            const isSelected = statusFilter === status;
            const label = status === "ALL" ? "All" : status === "ACTIVE" ? "Active" : "Inactive";
            const count =
              status === "ALL"
                ? tables.length
                : status === "ACTIVE"
                ? tables.filter((t) => t.isActive).length
                : tables.filter((t) => !t.isActive).length;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#121212] text-white shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center text-3xl">
            🪑
          </div>
          <h3 className="font-extrabold text-base text-[#121212]">No Tables Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `No tables matching "${searchQuery}". Try a different label.`
              : `There are currently no tables with status "${statusFilter}".`}
          </p>
          {(statusFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onViewQR={(t) => setQrModalTable(t)}
              onEdit={(t) => {
                setEditingTable(t);
                setIsTableModalOpen(true);
              }}
              onDelete={(t) => setTableToDelete(t)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Table Modal */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setEditingTable(null);
        }}
        onSave={handleSaveTable}
        table={editingTable}
      />

      {/* View QR Code Modal */}
      <QRCodeModal
        isOpen={Boolean(qrModalTable)}
        onClose={() => setQrModalTable(null)}
        table={qrModalTable}
      />

      {/* Delete Confirmation Modal */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-[#121212]">
                Delete Dining Table?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-zinc-800">&quot;{tableToDelete.label}&quot;</strong>?
                This action only deletes from local mock state in this milestone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
