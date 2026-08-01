"use client";

import * as React from "react";

import { useUser } from "@/providers/user-provider";
import {
  useDeleteWebSubscriptionMutation,
  useCreateWebSubscriptionMutation,
  useRefuseWebSubscriptionMutation,
  type WebSubscriptionCreateResponse,
} from "@/components/web-subscriptions/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Id } from "@/convex/_generated/dataModel";
import { useServiceWorker } from "@/components/web-subscriptions/use-service-worker";
import { usePermissionState } from "@/components/web-subscriptions/use-permission-state";
import type { UseMutationResult } from "@tanstack/react-query";
import { Bell, Dot } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface TomatiniWebSubscription {
  vapidPublicKey: string;
  webSubscriptionId: Id<"webSubscriptions">;
}

export function useTomatiniWebSubscription() {
  const [
    tomatiniWebSubscription,
    setTomatiniWebSubscription,
    removeTomatiniWebSubscription,
  ] = useLocalStorage<TomatiniWebSubscription | null | undefined>(
    "tomatiniWebSubscription",
    undefined,
  );
  return {
    tomatiniWebSubscription,
    setTomatiniWebSubscription,
    removeTomatiniWebSubscription,
  };
}

interface WebSubscriptionContextProps {
  browserNotificationPermissionState: PermissionState | undefined;
  createWebSubscriptionMutation: UseMutationResult<
    WebSubscriptionCreateResponse,
    Error,
    void,
    unknown
  >;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

interface WebSubscriptionProps {
  children: React.ReactNode;
}

interface WebSubscriptionState {
  isSupported: boolean;
  permissionError: string | undefined;
  userState: boolean | undefined;
  localStorage: TomatiniWebSubscription | null | undefined;
  browserState: PermissionState | undefined;
}

const WebSubscriptionContext = React.createContext<
  WebSubscriptionContextProps | undefined
>(undefined);

export function WebSubscription({ children }: WebSubscriptionProps) {
  const { user } = useUser();

  const { isSupported } = useServiceWorker("/sw.js");

  const [openDialog, setOpenDialog] = React.useState(false);

  const {
    permissionState: browserNotificationPermissionState,
    error: notificationPermissionError,
  } = usePermissionState("notifications");

  const { tomatiniWebSubscription } = useTomatiniWebSubscription();

  const webSubscriptionState = React.useMemo<WebSubscriptionState>(
    () => ({
      isSupported,
      permissionError: notificationPermissionError,
      userState: user?.notificationChannels?.push,
      localStorage: tomatiniWebSubscription,
      browserState: browserNotificationPermissionState,
    }),
    [
      isSupported,
      notificationPermissionError,
      user?.notificationChannels?.push,
      tomatiniWebSubscription,
      browserNotificationPermissionState,
    ],
  );

  const createWebSubscriptionMutation = useCreateWebSubscriptionMutation();
  const deleteWebSubscriptionMutation = useDeleteWebSubscriptionMutation();

  const sync = React.useCallback(() => {
    if (
      !webSubscriptionState.isSupported ||
      !user ||
      webSubscriptionState.permissionError ||
      typeof webSubscriptionState.browserState === "undefined" ||
      createWebSubscriptionMutation.isPending ||
      createWebSubscriptionMutation.isError ||
      deleteWebSubscriptionMutation.isPending
    )
      return;

    if (webSubscriptionState.browserState === "denied") {
      deleteWebSubscriptionMutation.mutate({});
      return;
    }

    if (
      (typeof webSubscriptionState.userState === "undefined" ||
        webSubscriptionState.userState === true) &&
      typeof webSubscriptionState.localStorage === "undefined"
    ) {
      setOpenDialog(true);
      return;
    }

    if (webSubscriptionState.userState === false) {
      deleteWebSubscriptionMutation.mutate({ all: true });
      return;
    }
  }, [
    webSubscriptionState,
    createWebSubscriptionMutation.isPending,
    createWebSubscriptionMutation.isError,
    deleteWebSubscriptionMutation.isPending,
    deleteWebSubscriptionMutation.mutate,
    user,
  ]);

  React.useEffect(() => {
    sync();
  }, [sync]);

  const contextValue = React.useMemo<WebSubscriptionContextProps>(
    () => ({
      browserNotificationPermissionState,
      createWebSubscriptionMutation,
      openDialog,
      setOpenDialog,
    }),
    [
      browserNotificationPermissionState,
      createWebSubscriptionMutation,
      openDialog,
    ],
  );

  return (
    <WebSubscriptionContext value={contextValue}>
      <WebSubscriptionForm />
      {children}
    </WebSubscriptionContext>
  );
}

export function useWebSubscription() {
  const context = React.useContext(WebSubscriptionContext);
  if (!context) {
    throw new Error(
      "useWebSubscriptions must be used within a WebSubscriptionProvider",
    );
  }
  return context;
}

export function WebSubscriptionForm() {
  const { openDialog, setOpenDialog, createWebSubscriptionMutation } =
    useWebSubscription();

  const refuseSubscriptionMutation = useRefuseWebSubscriptionMutation();

  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Enable Notifications
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enable notifications to receive updates from Tomatini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="text-sm text-foreground space-y-2">
          <li className="flex items-start gap-2">
            <Dot className="w-5 h-5 shrink-0" />
            New Document Readiness
          </li>
          <li className="flex items-start gap-2">
            <Dot className="w-5 h-5 shrink-0" />
            Reminder when you have documents with flash cards due for review
          </li>
        </ul>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            render={
              <Button
                variant="outline"
                disabled={
                  createWebSubscriptionMutation.isPending ||
                  refuseSubscriptionMutation.isPending
                }
                onClick={() => {
                  refuseSubscriptionMutation.mutate();
                }}
              >
                {refuseSubscriptionMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  "Not Now"
                )}
              </Button>
            }
          />
          <AlertDialogAction
            render={
              <Button
                disabled={
                  createWebSubscriptionMutation.isPending ||
                  refuseSubscriptionMutation.isPending
                }
                onClick={() => createWebSubscriptionMutation.mutate()}
              >
                {createWebSubscriptionMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  "Enable"
                )}
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
