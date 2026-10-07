import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/src/context/CartContext";
import { KitchenProvider } from "@/src/context/KitchenContext";
import { ThemeProvider } from "@/src/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DineGo – Digital QR Menu & Table Ordering",
  description: "Mobile-first restaurant ordering platform. Scan QR, browse menu items, place orders, and track live status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <KitchenProvider>
            <CartProvider>{children}</CartProvider>
          </KitchenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

