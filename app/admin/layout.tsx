"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import AdminSidebar from "@/src/components/admin/layout/AdminSidebar";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. All hooks called unconditionally at top level
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  // Auth state listener: verifies Firebase authentication and owner role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        if (tokenResult.claims.role === "owner") {
          setIsAuthenticated(true);
        } else {
          console.warn("Unauthorized: current account does not have owner role");
          await signOut(auth);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Failed to inspect user custom claims:", err);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Route protection effect: redirect unauthenticated access to /admin/login
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isAuthLoading, isLoginPage, router]);

  // Conditional renders start strictly AFTER all hooks have executed unconditionally

  // Case 1: Public login route
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Case 2: Authentication verification in progress
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#FF6B2C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 font-semibold text-xs tracking-wider uppercase">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  // Case 3: Redirecting unauthenticated user to /admin/login
  if (!isAuthenticated) {
    return null;
  }

  // Case 4: Authenticated owner — render full Admin layout
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMobileMenuToggle={() => setIsMobileOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
