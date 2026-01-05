"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const STORAGE_KEY = "mystudyplanner-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Light is default unless user previously chose dark
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "light";
    setTheme(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  // Prevent icon flicker before mount
  if (!mounted) {
    return (
      <button
        type="button"
        className="app-iconbtn border border-border bg-card"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="app-iconbtn border border-border bg-card"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}
