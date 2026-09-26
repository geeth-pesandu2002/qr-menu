"use client";

import React from "react";

export interface RestaurantInfoState {
  restaurantName: string;
  branchName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  coverImageUrl: string;
  logoUrl: string;
}

interface RestaurantInfoSettingsProps {
  info: RestaurantInfoState;
  onChange: (fields: Partial<RestaurantInfoState>) => void;
}

export default function RestaurantInfoSettings({
  info,
  onChange,
}: RestaurantInfoSettingsProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
      <div className="border-b border-zinc-100 pb-4">
        <h3 className="text-base font-extrabold text-[#121212]">
          Restaurant Profile & Branding
        </h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">
          Public profile details, physical branch location, and visual branding assets
        </p>
      </div>

      {/* Visual Brand Assets Preview */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Venue Banner & Brand Logo Preview
        </label>
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 h-44 sm:h-52">
          {/* Cover Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.coverImageUrl}
            alt="Venue cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Logo & Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B2C] border-2 border-white text-white flex items-center justify-center text-2xl font-black shadow-lg">
                🍽️
              </div>
              <div className="text-white drop-shadow-sm">
                <h4 className="text-lg font-black leading-tight">
                  {info.restaurantName || "Restaurant Name"}
                </h4>
                <p className="text-xs font-medium text-zinc-200">
                  {info.branchName} • {info.city}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold border border-white/20">
                🖼️ Mock Preview
              </span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium italic">
          Note: Visual asset upload controls are simulated in this frontend milestone.
        </p>
      </div>

      {/* Core Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Restaurant Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Brand Name
          </label>
          <input
            type="text"
            value={info.restaurantName}
            onChange={(e) => onChange({ restaurantName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="The Cozy Cafe"
          />
        </div>

        {/* Branch Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Branch / Outlet Name
          </label>
          <input
            type="text"
            value={info.branchName}
            onChange={(e) => onChange({ branchName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="Main Branch - Colombo 03"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Public Inquiries Email
          </label>
          <input
            type="email"
            value={info.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="contact@cozycafe.com"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Reservations Hotline
          </label>
          <input
            type="text"
            value={info.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="+94 11 234 5678"
          />
        </div>

        {/* Address / Location */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Street Address (Mock Location)
          </label>
          <input
            type="text"
            value={info.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="No. 42, Galle Road"
          />
        </div>

        {/* City & Country */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            City / Province
          </label>
          <input
            type="text"
            value={info.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="Colombo 03"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Country
          </label>
          <input
            type="text"
            value={info.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="Sri Lanka"
          />
        </div>
      </div>
    </div>
  );
}
