"use client";

import * as React from "react";
import { useEventListener } from "@/hooks/use-event-listener";

/**
 * A hook for monitoring browser permission state changes.
 *
 * @param name - The permission name to monitor (e.g., 'notifications', 'geolocation', etc.)
 * @returns An object containing the current permission state (PermissionState: "granted", "denied", "prompt") and any error that occurred
 *
 * @example
 * ```tsx
 * const { permissionState, error } = usePermissionState('notifications');
 *
 * if (permissionState === 'granted') {
 *   // Permission is granted
 * } else if (permissionState === 'denied') {
 *   // Permission is denied
 * }
 * ```
 */
export function usePermissionState(name: PermissionName) {
  const [permissionState, setPermissionState] = React.useState<
    PermissionState | undefined
  >(undefined);

  const [error, setError] = React.useState<string | undefined>(undefined);

  useEventListener("focus", async () => {
    if (navigator.permissions) {
      const permissionStatus = await navigator.permissions.query({ name });
      setPermissionState(permissionStatus.state);
    }
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let permissionStatus: PermissionStatus | null = null;

    if (navigator.permissions) {
      navigator.permissions
        .query({ name })
        .then((status) => {
          permissionStatus = status;
          setPermissionState(status.state);
          status.onchange = async () => {
            setPermissionState(status.state);
          };
        })
        .catch((error) => {
          setError(
            `Failed to query permission '${name}': ${error.message || JSON.stringify(error)}`,
          );
        });
    } else {
      setError("Permissions API not supported in this browser");
    }

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [name]);

  return { permissionState, error };
}
