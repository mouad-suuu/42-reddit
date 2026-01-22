"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Theme = "cyberpunk" | "manga";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "praxis-theme-v2"; // Changed to force reset to default
const DEFAULT_THEME: Theme = "cyberpunk";

/**
 * Provides theme state and toggle functionality to the app.
 * Reads/writes theme preference to localStorage, applies data-theme to HTML.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme with default to ensure server/client match during hydration
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Sync with localStorage after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && (stored === "cyberpunk" || stored === "manga")) {
        setThemeState(stored);
      }
    }
  }, []);

  // Apply theme to HTML element and persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === "cyberpunk" ? "manga" : "cyberpunk";
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and toggle function.
 * Returns default values if not within ThemeProvider (for SSR/static generation).
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  // Return safe defaults during SSR/static generation
  if (context === undefined) {
    return {
      theme: "manga" as Theme,
      setTheme: () => { },
      toggleTheme: () => { },
    };
  }
  return context;
}
