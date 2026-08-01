import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useTomatiniWebSubscription } from "@/components/web-subscriptions/web-subscription";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { webSubscriptionSchema } from "@/schemas/web-subscriptions";
import { getPushSubscriptionForKey } from "@/components/web-subscriptions/push-subscription";

export type WebSubscriptionCreateResponse = {
  webSubscriptionId: Id<"webSubscriptions">;
  pushSubscription: PushSubscription;
};

export function useCreateWebSubscriptionMutation() {
  const { setTomatiniWebSubscription } = useTomatiniWebSubscription();

  const subscribeToDatabaseMutation = useMutation(
    api.webSubscriptions.mutation.create,
  );

  const createWebSubscriptionMutation =
    useTanstackMutation<WebSubscriptionCreateResponse>({
      mutationFn: async () => {
        const currentVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!currentVapidKey) {
          throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
        }

        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await getPushSubscriptionForKey(
          registration.pushManager,
          urlBase64ToUint8Array(currentVapidKey),
        );

        const webSubscriptionId = await subscribeToDatabaseMutation({
          subscription: webSubscriptionSchema
            .omit({ userId: true })
            .parse(JSON.parse(JSON.stringify(pushSubscription))),
        });

        setTomatiniWebSubscription({
          vapidPublicKey: currentVapidKey,
          webSubscriptionId: webSubscriptionId,
        });

        return { webSubscriptionId, pushSubscription };
      },
      onSuccess() {
        toast.success("You have successfully subscribed.", {
          position: "top-right",
          className: "standalone:mt-[calc(env(safe-area-inset-top))]",
        });
      },
      onError(error) {
        // biome-ignore lint/suspicious/noConsole: Notifications
        console.error("Error subscribing to push notifications:", error);
        toast.error("Failed to enable push notifications. Please try again.", {
          position: "top-right",
          className: "standalone:mt-[calc(env(safe-area-inset-top))]",
        });
      },
    });
  return createWebSubscriptionMutation;
}

export function useDeleteWebSubscriptionMutation() {
  const {
    tomatiniWebSubscription,
    setTomatiniWebSubscription,
    removeTomatiniWebSubscription,
  } = useTomatiniWebSubscription();

  const unsubscribeFromDatabaseMutation = useMutation(
    api.webSubscriptions.mutation.destroy,
  );

  const deleteWebSubscriptionMutation = useTanstackMutation<
    string,
    Error,
    { all?: true }
  >({
    mutationFn: async ({ all }) => {
      const registration = await navigator.serviceWorker.ready;

      const existingSub = await registration.pushManager.getSubscription();

      await existingSub?.unsubscribe();

      if (all) {
        await unsubscribeFromDatabaseMutation({});

        removeTomatiniWebSubscription();
      } else if (tomatiniWebSubscription) {
        await unsubscribeFromDatabaseMutation({
          webSubscriptionId: tomatiniWebSubscription.webSubscriptionId,
        });

        setTomatiniWebSubscription(null);
      }

      return "success";
    },
  });
  return deleteWebSubscriptionMutation;
}

export function useRefuseWebSubscriptionMutation() {
  const { setTomatiniWebSubscription } = useTomatiniWebSubscription();

  const refuseSubscriptionDatabaseMutation = useMutation(
    api.webSubscriptions.mutation.refuseSubscription,
  );
  const refuseSubscriptionMutation = useTanstackMutation({
    mutationFn: async () => {
      await refuseSubscriptionDatabaseMutation();
      setTomatiniWebSubscription(null);
    },
  });
  return refuseSubscriptionMutation;
}
