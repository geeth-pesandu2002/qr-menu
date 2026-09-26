"use client";

import React from "react";

export interface GeneralSettingsState {
  restaurantName: string;
  contactEmail: string;
  phoneNumber: string;
  currency: string;
  serviceCharge: number;
  qrOrderingEnabled: boolean;
  openingHours: string;
}

interface GeneralSettingsProps {
  settings: GeneralSettingsState;
  onChange: (fields: Partial<GeneralSettingsState>) => void;
}

export default function GeneralSettings({
  settings,
  onChange,
}: GeneralSettingsProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
      <div className="border-b border-zinc-100 pb-4">
        <h3 className="text-base font-extrabold text-[#121212]">
          General Operations & Ordering
        </h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">
          Configure baseline restaurant parameters, customer table ordering, and service fee rates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Restaurant Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Restaurant Brand Name
          </label>
          <input
            type="text"
            value={settings.restaurantName}
            onChange={(e) => onChange({ restaurantName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="e.g. The Cozy Cafe"
          />
        </div>

        {/* Currency Display */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Menu Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] bg-white"
          >
            <option value="LKR">LKR (Rs. / Sri Lankan Rupee)</option>
            <option value="USD">USD ($ / US Dollar)</option>
            <option value="EUR">EUR (€ / Euro)</option>
            <option value="GBP">GBP (£ / British Pound)</option>
          </select>
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Operations Contact Email
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="contact@cozycafe.com"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Venue Phone Number
          </label>
          <input
            type="text"
            value={settings.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="+94 11 234 5678"
          />
        </div>

        {/* Service Charge */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Service Charge Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={settings.serviceCharge}
              onChange={(e) =>
                onChange({ serviceCharge: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] pr-10"
              placeholder="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
              %
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Standard dine-in service surcharge calculation
          </p>
        </div>

        {/* Opening Hours */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Daily Opening Hours
          </label>
          <input
            type="text"
            value={settings.openingHours}
            onChange={(e) => onChange({ openingHours: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="e.g. 10:00 AM - 11:00 PM"
          />
        </div>
      </div>

      {/* QR Ordering Toggle Switch */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <h4 className="text-sm font-extrabold text-[#121212]">
              Table QR Ordering System
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                settings.qrOrderingEnabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {settings.qrOrderingEnabled ? "Active" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            When enabled, patrons scanning table QR codes can submit food and drink orders directly to the kitchen
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({ qrOrderingEnabled: !settings.qrOrderingEnabled })
          }
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            settings.qrOrderingEnabled ? "bg-[#FF6B2C]" : "bg-zinc-300"
          }`}
          role="switch"
          aria-checked={settings.qrOrderingEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              settings.qrOrderingEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
