import * as React from "react";
import { useDetectEnv } from "@/hooks/use-detect-env";

export type ViewportMode = "normal-web" | "standalone" | "safari-mobile";

interface ViewportModeInfo {
  mode: ViewportMode;
  isStandalone: boolean;
  isSafariMobile: boolean;
  isNormalWeb: boolean;
}

export function useViewportMode(): ViewportModeInfo {
  const { isStandalone } = useDetectEnv();
  const [mode, setMode] = React.useState<ViewportMode>("normal-web");

  React.useEffect(() => {
    const detectMode = (): ViewportMode => {
      // Check if running in Safari on mobile
      const isSafariMobile =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

      if (isStandalone) {
        return "standalone";
      }
      if (isSafariMobile) {
        return "safari-mobile";
      }
      return "normal-web";
    };

    const currentMode = detectMode();
    setMode(currentMode);

    // Listen for changes in display mode (e.g., when PWA is installed/uninstalled)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => {
      setMode(detectMode());
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [isStandalone]);

  return {
    mode,
    isStandalone: mode === "standalone",
    isSafariMobile: mode === "safari-mobile",
    isNormalWeb: mode === "normal-web",
  };
}
