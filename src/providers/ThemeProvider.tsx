"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY } from "@/components/layout/ThemeScript/ThemeScript";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function persist(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setThemeState(current);
      return;
    }
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}
    const resolved: Theme = stored === "light" || stored === "dark" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    apply(resolved);
    setThemeState(resolved);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    apply(next);
    persist(next);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
