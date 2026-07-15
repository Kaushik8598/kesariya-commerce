"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 hover:bg-secondary hover:text-primary focus:outline-hidden cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5 overflow-hidden">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${
            currentTheme === "dark" ? "translate-y-0 rotate-0 scale-100" : "translate-y-10 rotate-90 scale-0"
          }`}
        >
          <Moon className="h-5 w-5" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${
            currentTheme === "dark" ? "-translate-y-10 -rotate-90 scale-0" : "translate-y-0 rotate-0 scale-100"
          }`}
        >
          <Sun className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}
