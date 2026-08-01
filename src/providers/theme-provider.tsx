"use client";

import type * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      storageKey="sbkl-turborepo-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return {
    theme: (theme ?? "system") as "system" | "dark" | "light",
    setTheme,
    resolvedTheme: (resolvedTheme ?? "light") as "dark" | "light",
  };
}
