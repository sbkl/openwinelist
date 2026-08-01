"use client";

import * as React from "react";

export function useServiceWorker(path: string) {
  const [isSupported, setIsSupported] = React.useState(false);
  // Initialize service worker and check support
  React.useEffect(() => {
    async function registerServiceWorker() {
      await navigator.serviceWorker.register(path, {
        scope: "/",
        updateViaCache: "none",
      });
    }
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, [path]);

  return { isSupported };
}
