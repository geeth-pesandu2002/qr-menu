"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinego_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        if (saved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Default to dark for luxury glowing glassmorphism experience
        document.documentElement.classList.add("dark");
      }
    } catch {}
    setIsMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("dinego_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Global Animated Dark/Light Mode Switcher Button
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-xl select-none active:scale-95 shadow-md ${
        isDark
          ? "bg-white/10 hover:bg-white/20 border border-white/25 text-amber-300 shadow-black/20"
          : "bg-black/5 hover:bg-black/10 border border-zinc-200 text-zinc-800 shadow-zinc-200"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle dark/light mode"
    >
      <span className="text-sm transition-transform duration-300 transform group-hover:rotate-12">
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline-block">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
};
