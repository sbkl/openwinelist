"use client";

import * as React from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import {
  AuthKitProvider,
  useAuth,
  useAccessToken,
} from "@workos-inc/authkit-nextjs/components";
import { ConvexQueryClient } from "@convex-dev/react-query";
import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { ViewportProvider } from "@/providers/viewport-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

function makeQueryClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set in .env.local");
  }
  const convex = new ConvexReactClient(convexUrl);
  // Share the authenticated Convex client with the react-query adapter.
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
  convexQueryClient.connect(queryClient);
  return { queryClient, convex };
}

let browserQueryClient:
  { queryClient: QueryClient; convex: ConvexReactClient } | undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const isAuthenticated = !!user;

  const fetchAccessToken = React.useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
      if (!user) {
        return null;
      }

      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null;
        }

        return (await getAccessToken()) ?? null;
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Notifications
        console.error("Failed to get access token:", error);
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken,
  };
}

export function AuthenticatedAppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { queryClient, convex } = getQueryClient();
  return (
    <ThemeProvider>
      <AuthKitProvider>
        <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
              <TooltipProvider data-slot="tooltip-provider">
                <ViewportProvider>{children}</ViewportProvider>
              </TooltipProvider>
            </NuqsAdapter>
            <Toaster position="bottom-right" />
          </QueryClientProvider>
        </ConvexProviderWithAuth>
      </AuthKitProvider>
    </ThemeProvider>
  );
}

type ProviderLeaf = React.ComponentType<{ children: React.ReactNode }>;

interface AppProviderRoutingBoundaryProps {
  authenticatedProvider?: ProviderLeaf;
  children: React.ReactNode;
  fixtureProvider?: ProviderLeaf;
  nodeEnv?: string;
}

export function AppProviderRoutingBoundary({
  authenticatedProvider: AuthenticatedProvider = AuthenticatedAppProviders,
  children,
}: AppProviderRoutingBoundaryProps) {
  return <AuthenticatedProvider>{children}</AuthenticatedProvider>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AppProviderRoutingBoundary>{children}</AppProviderRoutingBoundary>;
}
