"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKitchen } from "@/src/context/KitchenContext";

export default function KitchenLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAuthLoading } = useKitchen();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/kitchen/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/kitchen/dashboard");
      } else {
        setErrorMessage(res.error || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unexpected error during login.");
    } finally {
      setIsSubmitting(false);
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
                Sign in with your Kitchen credentials
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="text-base leading-none">⚠️</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

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
                    placeholder="kitchen@example.com"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#FF6B2C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs hover:text-zinc-600"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
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
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-bold text-sm transition-all shadow-lg shadow-[#FF6B2C]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>→</span>
                    <span>Sign In</span>
                  </>
                )}
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
