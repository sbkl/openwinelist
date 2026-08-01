"use node";

import { ConvexError, v } from "convex/values";
import webpush from "web-push";

import { internal } from "../../_generated/api";
import { env, internalAction } from "../../_generated/server";

webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export const pushNotification = internalAction({
  args: {
    userIds: v.array(v.id("users")),
    payload: v.object({
      title: v.string(),
      body: v.string(),
      url: v.optional(v.string()),
    }),
  },
  async handler(ctx, { userIds, payload }) {
    try {
      const subscriptions = await ctx.runQuery(
        internal.webSubscriptions.internal.query.listByUserIds,
        {
          userIds,
        },
      );

      await Promise.all(
        subscriptions.map(async (sub) => {
          return await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
              expirationTime: 60 * 60 * 24 * 30, // 30 days
            },
            JSON.stringify({
              ...payload,
              icon: `${env.SITE_URL.replace("http://", "https://")}/icon.png`,
              url: payload.url || env.SITE_URL.replace("http://", "https://"),
            }),
          );
        }),
      );

      return "success";
    } catch (e) {
      throw new ConvexError("Failed to send notification");
    }
  },
});
