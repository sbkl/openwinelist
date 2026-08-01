import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMatchedRoute(
  pathname: string,
  validPaths: string[],
): string | null {
  const pathSegments = pathname.split("/").filter(Boolean);

  // 1. Sort validPaths so most specific routes (static) are checked before dynamic ones
  const sortedPaths = [...validPaths].sort((a, b) => {
    const aSegs = a.split("/").filter(Boolean);
    const bSegs = b.split("/").filter(Boolean);

    // Sort by length first (descending)
    if (aSegs.length !== bSegs.length) return bSegs.length - aSegs.length;

    // If same length, prioritize the one with fewer dynamic segments [brackets]
    const aDynamic = aSegs.filter((s) => s.startsWith("[")).length;
    const bDynamic = bSegs.filter((s) => s.startsWith("[")).length;
    return aDynamic - bDynamic;
  });

  // 2. Find the first matching template
  for (const template of sortedPaths) {
    const templateSegments = template.split("/").filter(Boolean);

    if (templateSegments.length !== pathSegments.length) continue;

    const isMatch = templateSegments.every((tSeg, i) => {
      const pSeg = pathSegments[i];
      // Match if segment is a dynamic placeholder OR exact string match
      return (tSeg.startsWith("[") && tSeg.endsWith("]")) || tSeg === pSeg;
    });

    if (isMatch) return template;
  }

  return null;
}

export function oneOf<T>(input: T): T {
  return input;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
