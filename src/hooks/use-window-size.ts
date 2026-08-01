import * as React from "react";

import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { useEventListener } from "@/hooks/use-event-listener";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";

export type WindowSize<T extends number | undefined = number | undefined> = {
  width: T;
  height: T;
};

type UseWindowSizeOptions<InitializeWithValue extends boolean | undefined> = {
  initializeWithValue: InitializeWithValue;
  debounceDelay?: number;
};

const IS_SERVER = typeof window === "undefined";

// SSR version of useWindowSize.
export function useWindowSize(options: UseWindowSizeOptions<false>): WindowSize;
// CSR version of useWindowSize.
export function useWindowSize(
  options?: Partial<UseWindowSizeOptions<true>>,
): WindowSize<number>;
export function useWindowSize(
  options: Partial<UseWindowSizeOptions<boolean>> = {},
): WindowSize | WindowSize<number> {
  let { initializeWithValue = true } = options;
  if (IS_SERVER) {
    initializeWithValue = false;
  }

  const [windowSize, setWindowSize] = React.useState<WindowSize>(() => {
    if (initializeWithValue) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      width: undefined,
      height: undefined,
    };
  });

  const debouncedSetWindowSize = useDebounceCallback(
    (size: unknown) => setWindowSize(size as WindowSize),
    options.debounceDelay,
  );

  // Store original viewport height for input focus/blur handling
  const originalVhRef = React.useRef<number | null>(null);
  const isInputFocusedRef = React.useRef(false);

  const handleSize = React.useCallback(
    (isFromInputBlur = false) => {
      // Set window width/height to state
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty("--vw", `${vw}px`);

      // Detect viewport mode and set appropriate CSS variables
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isSafariMobile =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

      // Set mode-specific CSS variables
      document.documentElement.style.setProperty(
        "--viewport-mode",
        isStandalone
          ? "standalone"
          : isSafariMobile
            ? "safari-mobile"
            : "normal-web",
      );

      // For Safari mobile, we need to account for the dynamic viewport
      if (isSafariMobile) {
        // Use visual viewport if available (better for Safari mobile)
        const visualViewport = window.visualViewport;
        if (visualViewport) {
          const visualVh = visualViewport.height * 0.01;

          // If this is from input blur and we have a stored original height, restore it
          if (isFromInputBlur && originalVhRef.current !== null) {
            document.documentElement.style.setProperty(
              "--vh",
              `${originalVhRef.current}px`,
            );
          } else {
            // Store the original height if this is the first calculation
            if (originalVhRef.current === null) {
              originalVhRef.current = visualVh;
            }
            document.documentElement.style.setProperty("--vh", `${visualVh}px`);
          }
        }
      }

      const setSize = options.debounceDelay
        ? debouncedSetWindowSize
        : setWindowSize;

      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },
    [options.debounceDelay, debouncedSetWindowSize],
  );

  useEventListener("resize", () => handleSize(false));

  // Listen for input focus/blur events to handle viewport changes properly
  React.useEffect(() => {
    const handleInputFocus = () => {
      isInputFocusedRef.current = true;
    };

    const handleInputBlur = () => {
      isInputFocusedRef.current = false;
    };

    // Add event listeners for all input elements
    document.addEventListener("focusin", (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        handleInputFocus();
      }
    });

    document.addEventListener("focusout", (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        handleInputBlur();
      }
    });

    return () => {
      document.removeEventListener("focusin", handleInputFocus);
      document.removeEventListener("focusout", handleInputBlur);
    };
  }, []);

  // Listen for visual viewport changes (important for Safari mobile)
  React.useEffect(() => {
    if (window.visualViewport) {
      const handleVisualViewportResize = () => {
        // If input was just blurred, restore original height instead of recalculating
        if (!isInputFocusedRef.current && originalVhRef.current !== null) {
          handleSize(true); // Pass true to indicate this is from input blur
        } else {
          handleSize(false);
        }
      };

      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportResize,
      );
      return () =>
        window.visualViewport?.removeEventListener(
          "resize",
          handleVisualViewportResize,
        );
    }
  }, [handleSize]);

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return windowSize;
}
