"use client";

import * as React from "react";

// Platform configuration for notification behavior
interface PlatformConfig {
  id: string;
  name: string;
  userAgentPattern: RegExp;
  requiresModal: boolean;
  requiresPWA: boolean;
  recoveryInstructions: {
    title: string;
    steps: string[];
  };
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: "safari-macos",
    name: "Safari macOS",
    userAgentPattern: /Safari/,
    requiresModal: true,
    requiresPWA: true,
    recoveryInstructions: {
      title: "PWA Settings:",
      steps: [
        'Click "Tomatini" in the macOS menu bar',
        "Go to Settings → Privacy & Security",
        'Click "Notifications"',
        'Find Tomatini and toggle "Allow Notifications" ON',
        'Return to this app and click "Try Again"',
      ],
    },
  },
  {
    id: "safari-ios",
    name: "Safari iOS",
    userAgentPattern: /iPhone|iPod/,
    requiresModal: true,
    requiresPWA: true,
    recoveryInstructions: {
      title: "iOS Settings:",
      steps: [
        "Add app to Home Screen first (Safari → Share → Add to Home Screen)",
        "Go to iOS Settings → Notifications",
        "Find Tomatini and enable notifications",
        "Return to the app and try again",
      ],
    },
  },
  {
    id: "safari-ipados",
    name: "Safari iPadOS",
    userAgentPattern: /iPad/,
    requiresModal: true,
    requiresPWA: true,
    recoveryInstructions: {
      title: "iPadOS Settings:",
      steps: [
        "Add app to Home Screen first (Safari → Share → Add to Home Screen)",
        "Go to iPadOS Settings → Notifications",
        "Find Tomatini and enable notifications",
        "Return to the app and try again",
      ],
    },
  },
  {
    id: "chrome",
    name: "Chrome",
    userAgentPattern: /Chrome/,
    requiresModal: false,
    requiresPWA: false,
    recoveryInstructions: {
      title: "Chrome Settings:",
      steps: [
        "Click the lock icon in the address bar",
        'Set Notifications to "Allow"',
        "Refresh the page",
      ],
    },
  },
  {
    id: "firefox",
    name: "Firefox",
    userAgentPattern: /Firefox/,
    requiresModal: false,
    requiresPWA: false,
    recoveryInstructions: {
      title: "Firefox Settings:",
      steps: [
        "Click the shield icon in the address bar",
        'Set Notifications to "Allow"',
        "Refresh the page",
      ],
    },
  },
  {
    id: "edge",
    name: "Edge",
    userAgentPattern: /Edg/,
    requiresModal: false,
    requiresPWA: false,
    recoveryInstructions: {
      title: "Edge Settings:",
      steps: [
        "Click the lock icon in the address bar",
        'Set Notifications to "Allow"',
        "Refresh the page",
      ],
    },
  },
];

// Function to test user agent against pattern
function testUserAgent(pattern: RegExp): boolean {
  if (typeof window === "undefined") return false;
  return pattern.test(navigator.userAgent);
}

// Function to detect current platform
function detectPlatform(): PlatformConfig {
  if (typeof window === "undefined") {
    return (
      PLATFORM_CONFIGS[0] ?? {
        id: "unknown",
        name: "Unknown Platform",
        userAgentPattern: /.*/,
        requiresModal: false,
        requiresPWA: false,
        recoveryInstructions: {
          title: "Browser Settings:",
          steps: [
            "Check your browser's notification settings",
            "Allow notifications for this site",
            "Refresh the page",
          ],
        },
      }
    );
  }

  for (const config of PLATFORM_CONFIGS) {
    if (testUserAgent(config.userAgentPattern)) {
      return config;
    }
  }

  // Default fallback for unknown platforms
  return {
    id: "unknown",
    name: "Unknown Platform",
    userAgentPattern: /.*/,
    requiresModal: false,
    requiresPWA: false,
    recoveryInstructions: {
      title: "Browser Settings:",
      steps: [
        "Check your browser's notification settings",
        "Allow notifications for this site",
        "Refresh the page",
      ],
    },
  };
}

export function useDetectEnv() {
  const [isStandalone, setIsStandalone] = React.useState<boolean | undefined>(
    undefined,
  );
  const [OS, setOS] = React.useState<
    "ios" | "android" | "macos" | "windows" | "linux" | "other" | undefined
  >(undefined);

  const [currentPlatform, setCurrentPlatform] =
    React.useState<PlatformConfig | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const platform = detectPlatform();
      setCurrentPlatform(platform);

      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
          ("standalone" in window.navigator &&
            typeof window.navigator.standalone === "boolean" &&
            window.navigator.standalone === true),
      );

      const isIOSDevice =
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.maxTouchPoints > 1 &&
            /Macintosh/.test(navigator.userAgent))) &&
        !(window as { MSStream?: unknown }).MSStream;

      if (isIOSDevice) {
        setOS("ios");
      }

      const isAndroidDevice =
        /Android/.test(navigator.userAgent) &&
        !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

      if (isAndroidDevice) {
        setOS("android");
      }

      const isMacOSDevice = /Macintosh/.test(navigator.userAgent);

      if (isMacOSDevice) {
        setOS("macos");
      }

      const isWindowsDevice = /Windows/.test(navigator.userAgent);

      if (isWindowsDevice) {
        setOS("windows");
      }

      const isLinuxDevice = /Linux/.test(navigator.userAgent);

      if (isLinuxDevice) {
        setOS("linux");
      }
    }
  }, []);

  return {
    OS,
    isStandalone,
    currentPlatform,
  };
}
