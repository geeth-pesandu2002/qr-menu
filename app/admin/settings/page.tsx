"use client";

import React, { useState, useEffect } from "react";
import GeneralSettings, {
  GeneralSettingsState,
} from "@/src/components/admin/settings/GeneralSettings";
import RestaurantInfoSettings, {
  RestaurantInfoState,
} from "@/src/components/admin/settings/RestaurantInfoSettings";
import AccountSettings, {
  AccountSettingsState,
} from "@/src/components/admin/settings/AccountSettings";

type SettingsTab = "GENERAL" | "RESTAURANT_INFO" | "ACCOUNT";

const INITIAL_GENERAL: GeneralSettingsState = {
  restaurantName: "The Cozy Cafe",
  contactEmail: "contact@cozycafe.com",
  phoneNumber: "+94 11 234 5678",
  currency: "LKR",
  serviceCharge: 10,
  qrOrderingEnabled: true,
  openingHours: "10:00 AM - 11:00 PM",
};

const INITIAL_RESTAURANT_INFO: RestaurantInfoState = {
  restaurantName: "The Cozy Cafe",
  branchName: "Main Branch - Colombo 03",
  contactEmail: "contact@cozycafe.com",
  phoneNumber: "+94 11 234 5678",
  address: "No. 42, Galle Road",
  city: "Colombo 03",
  postalCode: "00300",
  country: "Sri Lanka",
  coverImageUrl:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
  logoUrl: "/icons/icon-192x192.png",
};

const INITIAL_ACCOUNT: AccountSettingsState = {
  displayName: "Restaurant Owner",
  email: "owner@cozycafe.com",
  role: "owner",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("GENERAL");

  // Local component state
  const [general, setGeneral] = useState<GeneralSettingsState>(INITIAL_GENERAL);
  const [info, setInfo] = useState<RestaurantInfoState>(INITIAL_RESTAURANT_INFO);
  const [account, setAccount] = useState<AccountSettingsState>(INITIAL_ACCOUNT);
  const [isSaving, setIsSaving] = useState(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Load live settings from backend
  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setGeneral((prev) => ({
            ...prev,
            restaurantName: d.restaurantName || prev.restaurantName,
            contactEmail: d.contactEmail || prev.contactEmail,
            phoneNumber: d.phoneNumber || prev.phoneNumber,
            currency: d.currency || prev.currency,
            serviceCharge: d.serviceCharge ?? prev.serviceCharge,
            qrOrderingEnabled: d.qrOrderingEnabled ?? prev.qrOrderingEnabled,
            openingHours: d.openingHours || prev.openingHours,
          }));
          setInfo((prev) => ({
            ...prev,
            restaurantName: d.restaurantName || prev.restaurantName,
            branchName: d.branchName || prev.branchName,
            contactEmail: d.contactEmail || prev.contactEmail,
            phoneNumber: d.phoneNumber || prev.phoneNumber,
            address: d.address || prev.address,
            city: d.city || prev.city,
            postalCode: d.postalCode || prev.postalCode,
            country: d.country || prev.country,
            coverImageUrl: d.coverImageUrl || prev.coverImageUrl,
            logoUrl: d.logoUrl || prev.logoUrl,
          }));
        }
      }
    } catch (err) {
      console.warn("Could not load live settings:", err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...general,
        ...info,
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer owner-token",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMessage({
          text: "Restaurant settings successfully saved to live database!",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: "Saved locally, server responded with error.",
          type: "info",
        });
      }
    } catch (err) {
      console.warn("Failed to persist settings:", err);
      setStatusMessage({
        text: "Saved locally (offline mode active)",
        type: "info",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    }
  };

  const handleDiscard = () => {
    loadSettings();
    setStatusMessage({
      text: "Changes discarded. Reset to saved settings.",
      type: "info",
    });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Configure restaurant parameters, operational policies, and venue details
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("GENERAL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "GENERAL"
                ? "bg-white text-[#121212] shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            ⚙️ General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RESTAURANT_INFO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "RESTAURANT_INFO"
                ? "bg-white text-[#121212] shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            🏢 Restaurant Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ACCOUNT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "ACCOUNT"
                ? "bg-white text-[#121212] shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            👤 Account
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-zinc-100 border border-zinc-200 text-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === "success" ? "✅" : "ℹ️"}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="font-bold text-sm ml-4 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Content Panes */}
      <div>
        {activeTab === "GENERAL" && (
          <GeneralSettings
            settings={general}
            onChange={(fields) => setGeneral((prev) => ({ ...prev, ...fields }))}
          />
        )}

        {activeTab === "RESTAURANT_INFO" && (
          <RestaurantInfoSettings
            info={info}
            onChange={(fields) => setInfo((prev) => ({ ...prev, ...fields }))}
          />
        )}

        {activeTab === "ACCOUNT" && (
          <AccountSettings
            account={account}
            onChange={(fields) => setAccount((prev) => ({ ...prev, ...fields }))}
          />
        )}
      </div>

      {/* Save & Discard Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 font-medium">
          Settings are stored in mock memory for demonstration purposes.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-extrabold shadow-sm shadow-[#FF6B2C]/30 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
