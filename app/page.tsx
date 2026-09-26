"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-[#FF6B2C] selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B2C] flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#FF6B2C]/30">
            🍽️
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Dine<span className="text-[#FF6B2C]">Go</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/kitchen/login"
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>👨‍🍳</span>
            <span>Kitchen Staff</span>
          </Link>
          <Link
            href="/t/05"
            className="px-5 py-2.5 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white text-sm font-semibold transition-all transform hover:scale-105 shadow-md shadow-[#FF6B2C]/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Fully Bright & Vivid Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Soft Vignette Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-[#121212]" />

        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center gap-6 py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B2C]/10 border border-[#FF6B2C]/30 text-[#FF6B2C] text-xs font-semibold uppercase tracking-wider w-fit">
            <span>✨</span> SMART DINING • HAPPIER GUESTS
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Scan. Order. <span className="text-[#FF6B2C]">Enjoy.</span>
          </h1>

          <p className="text-lg text-white max-w-2xl leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            A modern QR menu and table ordering system for cafes and restaurants. Delight your customers, streamline operations, and grow your business.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/t/05"
              className="px-8 py-4 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-semibold text-base transition-all transform hover:scale-105 shadow-xl shadow-[#FF6B2C]/30 flex items-center gap-2"
            >
              Get Started <span className="text-lg">→</span>
            </Link>
            <Link
              href="/scan"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-base transition-all flex items-center gap-2"
            >
              <span>📷</span> Scan QR Demo
            </Link>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/15 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">🌱</span>
              <span className="font-semibold text-white text-sm">No App Installation</span>
              <span className="text-xs text-zinc-300">Scans instantly in browser</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">⚡</span>
              <span className="font-semibold text-white text-sm">Real-Time Orders</span>
              <span className="text-xs text-zinc-300">Instant kitchen dispatch</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">📊</span>
              <span className="font-semibold text-white text-sm">Simple & Powerful</span>
              <span className="text-xs text-zinc-300">Live order tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAF7F2] text-[#121212] px-6">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <span className="text-[#FF6B2C] font-bold text-xs uppercase tracking-widest">HOW IT WORKS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] mt-2 mb-12">
            A Better Dining Experience in 4 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Scan the QR Code</h3>
              <p className="text-sm text-zinc-600">
                Customers scan the unique QR code on their table using their phone camera.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <div className="text-4xl mb-3">🍔</div>
              <h3 className="font-bold text-lg mb-2">Browse & Order</h3>
              <p className="text-sm text-zinc-600">
                Explore the menu, customize items with add-ons, and place the order instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <div className="text-4xl mb-3">👨‍🍳</div>
              <h3 className="font-bold text-lg mb-2">Kitchen Prepares</h3>
              <p className="text-sm text-zinc-600">
                Orders appear on the kitchen staff display in real time for prompt preparation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF6B2C] text-white font-bold flex items-center justify-center mb-4">
                4
              </div>
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-lg mb-2">Track Your Order</h3>
              <p className="text-sm text-zinc-600">
                See live status updates directly on your phone until your meal is served.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Banner */}
      <section className="py-16 bg-[#06402B] text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-[#E7A451] font-bold text-xs uppercase tracking-widest">BUILT FOR MODERN RESTAURANTS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Less Waiting. More Happy Customers.
            </h2>
            <p className="text-zinc-200 text-sm max-w-lg">
              Whether you run a cozy cafe or a busy restaurant, DineGo helps you create a seamless dining experience.
            </p>
            <div className="pt-2">
              <Link
                href="/t/05"
                className="px-6 py-3 rounded-full bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 w-fit"
              >
                Get Started Today →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-2xl">🍽️</span>
              <p className="font-bold text-sm mt-2">Easy Ordering</p>
              <p className="text-xs text-zinc-300">For Customers</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-2xl">👥</span>
              <p className="font-bold text-sm mt-2">Efficient Ops</p>
              <p className="text-xs text-zinc-300">For Kitchen & Staff</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-2xl">💚</span>
              <p className="font-bold text-sm mt-2">Fewer Errors</p>
              <p className="text-xs text-zinc-300">Happier Guests</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-2xl">📈</span>
              <p className="font-bold text-sm mt-2">Grow Business</p>
              <p className="text-xs text-zinc-300">More Table Turnover</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#121212] border-t border-white/10 text-center text-xs text-zinc-400">
        <p>© 2026 DineGo. Digital QR Menu & Table Ordering Web Application.</p>
      </footer>
    </div>
  );
}
