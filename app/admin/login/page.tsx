"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("owner@cozycafe.com");
  const [password, setPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Frontend-only simulation for milestone 1
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Restaurant Visual Panel */}
        <div className="md:col-span-6 relative p-8 sm:p-10 flex flex-col justify-between text-white bg-zinc-950 overflow-hidden min-h-[260px] md:min-h-full">
          {/* Background Image with dark culinary atmosphere */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#FF6B2C]/30">
              🍽️
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Dine<span className="text-[#FF6B2C]">Go</span>
              </span>
              <span className="text-[10px] block font-semibold text-zinc-400 -mt-1 tracking-wider uppercase">
                Owner Suite
              </span>
            </div>
          </div>

          {/* Center Visual Copy */}
          <div className="relative z-10 space-y-3 max-w-sm my-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-amber-300">
              <span>👑</span> Executive Control Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Manage Your <br />
              Restaurant with <span className="text-[#FF6B2C]">Precision.</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Real-time analytics, live order monitoring, instant menu updates, and QR table configuration all in one unified portal.
            </p>
          </div>

          {/* Bottom Info Badges */}
          <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Direct Kitchen Sync
            </span>
            <span className="text-[11px] text-zinc-500">The Cozy Cafe</span>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full space-y-6">
            {/* Form Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] mx-auto flex items-center justify-center text-2xl font-bold mb-1">
                🏪
              </div>
              <h2 className="text-2xl font-extrabold text-[#121212] tracking-tight">
                Restaurant Admin
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Sign in with your owner credentials
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    ✉️
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@restaurant.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    🔒
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#FF6B2C] focus:ring-[#FF6B2C]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Please contact your system administrator to reset owner credentials.")}
                  className="text-xs font-semibold text-[#FF6B2C] hover:text-[#E55A1F] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-sm transition-all shadow-lg shadow-[#FF6B2C]/25 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Portal Switcher Footnote */}
            <div className="pt-2 text-center border-t border-zinc-100 space-y-1 text-xs text-zinc-400">
              <p>Looking for another portal?</p>
              <div className="flex items-center justify-center gap-3 font-semibold text-zinc-600 pt-0.5">
                <Link
                  href="/kitchen/login"
                  className="hover:text-[#FF6B2C] hover:underline"
                >
                  Kitchen Portal ↗
                </Link>
                <span>•</span>
                <Link href="/" className="hover:text-[#FF6B2C] hover:underline">
                  Public Landing ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
