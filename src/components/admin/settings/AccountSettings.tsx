"use client";

import React from "react";

export interface AccountSettingsState {
  displayName: string;
  email: string;
  role: string;
}

interface AccountSettingsProps {
  account: AccountSettingsState;
  onChange: (fields: Partial<AccountSettingsState>) => void;
}

export default function AccountSettings({
  account,
  onChange,
}: AccountSettingsProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
      <div className="border-b border-zinc-100 pb-4">
        <h3 className="text-base font-extrabold text-[#121212]">
          Admin & Owner Account
        </h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">
          Operator profile details and administrative permissions
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-zinc-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B2C] text-white flex items-center justify-center text-xl font-black shadow-md shadow-[#FF6B2C]/25 flex-shrink-0">
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-[#121212]">
                {account.displayName}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/20">
                {account.role}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {account.email}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Owner / Admin Display Name
          </label>
          <input
            type="text"
            value={account.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Account Email
          </label>
          <input
            type="email"
            value={account.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]"
            placeholder="owner@cozycafe.com"
          />
        </div>

        {/* Role (Read only) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Role
          </label>
          <input
            type="text"
            value={account.role}
            readOnly
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-500 bg-zinc-50 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Neutral Note */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 font-medium">
        Account authentication is not managed from this Settings UI in the current milestone.
      </div>
    </div>
  );
}
