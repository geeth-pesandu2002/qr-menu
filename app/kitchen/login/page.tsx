"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKitchen } from "@/src/context/KitchenContext";

export default function KitchenLoginPage() {
  const router = useRouter();
  const { login } = useKitchen();

  const [email, setEmail] = useState("staff@cozycafe.com");
  const [password, setPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      router.push("/kitchen/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        {/* Left Chef Background Banner */}
        <div className="md:col-span-6 relative p-8 flex flex-col justify-between text-white bg-zinc-900 overflow-hidden min-h-[240px] md:min-h-full">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-lg">
              👨‍🍳
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Dine<span className="text-[#FF6B2C]">Go</span>
            </span>
          </div>

          {/* Center Hero Text */}
          <div className="relative z-10 space-y-2 max-w-sm">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Great Food <br />
              Starts <span className="text-[#FF6B2C]">Here.</span>
            </h1>
            <p className="text-sm text-zinc-300 font-medium">
              Fresh orders. Happy diners.
            </p>
          </div>

          {/* Bottom Tagline Badge */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold italic text-amber-300">
              Good Food Better Moments
            </span>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] mx-auto flex items-center justify-center text-2xl font-bold mb-2">
                🍳
              </div>
              <h2 className="text-2xl font-extrabold text-[#121212]">Kitchen Portal</h2>
              <p className="text-xs text-zinc-500 font-medium">
                Sign in to manage live orders
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    👤
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    🔒
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                    👁️
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#FF6B2C] focus:ring-[#FF6B2C]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-sm transition-all shadow-lg shadow-[#FF6B2C]/30 flex items-center justify-center gap-2"
              >
                <span>→</span>
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("staff@cozycafe.com");
                  if (login("staff@cozycafe.com")) {
                    try {
                      localStorage.setItem("dinego_auth_token", "Bearer staff-token");
                    } catch {}
                    router.push("/kitchen/dashboard");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>Demo Staff 1-Click Access</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-400 font-medium">
                Fueling great food, together. 🍴
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
