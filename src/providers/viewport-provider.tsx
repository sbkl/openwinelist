"use client";

import * as React from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { useViewportMode } from "@/hooks/use-viewport-mode";

interface ViewportProviderProps {
  children: React.ReactNode;
}

export function ViewportProvider({ children }: ViewportProviderProps) {
  // Initialize viewport size handling
  useWindowSize();
  const { mode } = useViewportMode();

  // Set additional CSS variables based on viewport mode
  React.useEffect(() => {
    const root = document.documentElement;

    // Set mode-specific classes for additional styling if needed
    root.classList.remove(
      "viewport-normal-web",
      "viewport-standalone",
      "viewport-safari-mobile",
    );
    root.classList.add(`viewport-${mode}`);

    if (mode === "standalone") {
      root.style.setProperty("--chat-input-bottom", "0px");
    } else if (mode === "normal-web") {
      root.style.setProperty("--chat-input-bottom", "16px");
    } else if (mode === "safari-mobile") {
      root.style.setProperty("--chat-input-bottom", "0px");
    }

    // Set additional CSS variables for debugging/development
    if (process.env.NODE_ENV === "development") {
      root.style.setProperty("--debug-viewport-mode", mode);
    }
  }, [mode]);

  return <>{children}</>;
}
