"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sparkles, PenTool } from "lucide-react";

/**
 * Toggle button to switch between Cyberpunk and Manga themes.
 * Displays different icons and labels based on the current theme.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isCyberpunk = theme === "cyberpunk";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Theme toggle clicked, current theme:", theme);
    toggleTheme();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      type="button"
      className="gap-2 font-bold uppercase tracking-wider group transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label={`Switch to ${isCyberpunk ? "Manga" : "Cyberpunk"} theme`}
    >
      {isCyberpunk ? (
        <>
          <PenTool className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
          <span className="hidden sm:inline">Manga</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
          <span className="hidden sm:inline">Cyber</span>
        </>
      )}
    </Button>
  );
}
