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
import { auth } from "@/src/lib/firebase";
import { adminFetch } from "@/src/lib/admin-api";

type SettingsTab = "GENERAL" | "RESTAURANT_INFO" | "ACCOUNT";

const DEFAULT_GENERAL: GeneralSettingsState = {
  restaurantName: "",
  contactEmail: "",
  phoneNumber: "",
  currency: "LKR",
  serviceCharge: 10,
  qrOrderingEnabled: true,
  openingHours: "",
};

const DEFAULT_RESTAURANT_INFO: RestaurantInfoState = {
  restaurantName: "",
  branchName: "",
  contactEmail: "",
  phoneNumber: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  coverImageUrl: "",
  logoUrl: "",
};

const INITIAL_ACCOUNT: AccountSettingsState = {
  displayName: "Restaurant Owner",
  email: "owner@cozycafe.com",
  role: "owner",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("GENERAL");

  // Local component form state
  const [general, setGeneral] = useState<GeneralSettingsState>(DEFAULT_GENERAL);
  const [info, setInfo] = useState<RestaurantInfoState>(DEFAULT_RESTAURANT_INFO);
  const [account, setAccount] = useState<AccountSettingsState>(INITIAL_ACCOUNT);

  // Loading and action states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Status message alert banner
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // 1. Fetch settings from backend API
  const loadSettings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await adminFetch<{ success: boolean; data: any }>("/backend-api/settings");
      if (res?.success && res.data) {
        const data = res.data;
        setGeneral({
          restaurantName: data.restaurantName || "",
          contactEmail: data.contactEmail || "",
          phoneNumber: data.phoneNumber || "",
          currency: data.currency || "LKR",
          serviceCharge: typeof data.serviceCharge === "number" ? data.serviceCharge : 10,
          qrOrderingEnabled: data.qrOrderingEnabled ?? true,
          openingHours: data.openingHours || "",
        });
        setInfo({
          restaurantName: data.restaurantName || "",
          branchName: data.branchName || "",
          contactEmail: data.contactEmail || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
          coverImageUrl: data.coverImageUrl || "",
          logoUrl: data.logoUrl || "",
        });
      } else {
        throw new Error("Invalid response format received from settings API");
      }
    } catch (err: any) {
      console.error("Failed to load settings from server:", err);
      setLoadError(err?.message || "Failed to load restaurant settings from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Sync account details with current Firebase auth user if available
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAccount({
        displayName: user.displayName || "Restaurant Owner",
        email: user.email || "owner@cozycafe.com",
        role: "owner",
      });
    }
  }, []);

  // 2. Persist settings via PUT /backend-api/settings
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        restaurantName: general.restaurantName || info.restaurantName,
        contactEmail: general.contactEmail || info.contactEmail,
        phoneNumber: general.phoneNumber || info.phoneNumber,
        currency: general.currency,
        serviceCharge: general.serviceCharge,
        qrOrderingEnabled: general.qrOrderingEnabled,
        openingHours: general.openingHours,
        branchName: info.branchName,
        address: info.address,
        city: info.city,
        postalCode: info.postalCode,
        country: info.country,
        coverImageUrl: info.coverImageUrl,
        logoUrl: info.logoUrl,
      };

      const res = await adminFetch<{ success: boolean; data: any }>("/backend-api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res?.success && res.data) {
        const data = res.data;
        setGeneral((prev) => ({
          ...prev,
          restaurantName: data.restaurantName ?? prev.restaurantName,
          contactEmail: data.contactEmail ?? prev.contactEmail,
          phoneNumber: data.phoneNumber ?? prev.phoneNumber,
          currency: data.currency ?? prev.currency,
          serviceCharge: typeof data.serviceCharge === "number" ? data.serviceCharge : prev.serviceCharge,
          qrOrderingEnabled: data.qrOrderingEnabled ?? prev.qrOrderingEnabled,
          openingHours: data.openingHours ?? prev.openingHours,
        }));
        setInfo((prev) => ({
          ...prev,
          restaurantName: data.restaurantName ?? prev.restaurantName,
          branchName: data.branchName ?? prev.branchName,
          contactEmail: data.contactEmail ?? prev.contactEmail,
          phoneNumber: data.phoneNumber ?? prev.phoneNumber,
          address: data.address ?? prev.address,
          city: data.city ?? prev.city,
          postalCode: data.postalCode ?? prev.postalCode,
          country: data.country ?? prev.country,
          coverImageUrl: data.coverImageUrl ?? prev.coverImageUrl,
          logoUrl: data.logoUrl ?? prev.logoUrl,
        }));
        setStatusMessage({
          text: "Restaurant settings saved successfully.",
          type: "success",
        });
      } else {
        throw new Error("Failed to save settings: server returned an invalid response.");
      }
    } catch (err: any) {
      console.error("Failed to save settings to server:", err);
      setStatusMessage({
        text: err?.message || "Failed to save settings. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Discard changes and re-fetch real persisted values
  const handleDiscard = async () => {
    setStatusMessage({
      text: "Reloading persisted settings from server...",
      type: "info",
    });
    await loadSettings();
    setStatusMessage({
      text: "Changes discarded. Persisted settings restored.",
      type: "info",
    });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
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

      {/* Load Error Alert Banner with Retry */}
      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadSettings}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Action Status Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 border border-rose-200 text-rose-900"
              : "bg-zinc-100 border border-zinc-200 text-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === "success" ? "✅" : statusMessage.type === "error" ? "❌" : "ℹ️"}</span>
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

      {/* Loading State Skeleton Box */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
          <div className="w-8 h-8 border-3 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Loading restaurant settings...
          </p>
        </div>
      ) : (
        /* Tab Content Panes */
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
      )}

      {/* Save & Discard Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 font-medium">
          Configure operational policies, branch locations, and dining platform parameters.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isLoading || isSaving}
            onClick={handleDiscard}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="button"
            disabled={isLoading || isSaving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-xs font-extrabold shadow-sm shadow-[#FF6B2C]/30 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

