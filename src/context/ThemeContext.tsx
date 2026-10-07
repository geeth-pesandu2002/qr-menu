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
  const [theme, setThemeState] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinego_theme") as Theme | null;
      const initialTheme = saved === "dark" || saved === "light" ? saved : "light";
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme("light");
    }
    setIsMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem("dinego_theme", newTheme);
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

// Global Segmented Animated Dark/Light Mode Switcher Button
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center bg-black/5 dark:bg-white/10 p-0.5 sm:p-1 rounded-full border border-black/10 dark:border-white/15 backdrop-blur-2xl shadow-inner select-none transition-colors ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all duration-200 active:scale-95 ${
          !isDark
            ? "bg-white text-zinc-900 shadow-sm shadow-black/10 font-black scale-102"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
        }`}
        title="Switch to Light Mode"
      >
        <span>☀️</span>
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all duration-200 active:scale-95 ${
          isDark
            ? "bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/40 font-black scale-102"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
        }`}
        title="Switch to Dark Mode"
      >
        <span>🌙</span>
        <span>Dark</span>
      </button>
    </div>
  );
};
