import { protectedMutation } from "../functions";
import { webSubscriptionSchema } from "../../schemas/web-subscriptions";
import { zid } from "../../schemas/zid";

export const create = protectedMutation({
  args: {
    subscription: webSubscriptionSchema.omit({ userId: true }),
  },
  async handler(ctx, { subscription }) {
    const subscriptionId = await ctx.db.insert("webSubscriptions", {
      ...subscription,
      userId: ctx.user._id,
    });
    if (!ctx.user.notificationChannels?.push) {
      await ctx.db.patch("users", ctx.user._id, {
        notificationChannels: {
          ...ctx.user.notificationChannels,
          push: true,
        },
      });
    }
    return subscriptionId;
  },
});

export const destroy = protectedMutation({
  args: {
    webSubscriptionId: zid("webSubscriptions").optional(),
  },
  async handler(ctx, { webSubscriptionId }) {
    if (webSubscriptionId) {
      const existingWebSubscription = await ctx.db.get(
        "webSubscriptions",
        webSubscriptionId,
      );
      if (existingWebSubscription) {
        await ctx.db.delete("webSubscriptions", webSubscriptionId);
      }
      const hasWebSubscription = await ctx.db
        .query("webSubscriptions")
        .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
        .first();

      if (hasWebSubscription === null) {
        await ctx.db.patch("users", ctx.user._id, {
          notificationChannels: {
            ...ctx.user.notificationChannels,
            push: false,
          },
        });
      }
      return "success";
    }
    const webSubscriptions = await ctx.db
      .query("webSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
    for (const webSubscription of webSubscriptions) {
      await ctx.db.delete("webSubscriptions", webSubscription._id);
    }
    await ctx.db.patch("users", ctx.user._id, {
      notificationChannels: {
        ...(ctx.user.notificationChannels ?? {}),
        push: false,
      },
    });
    return "success";
  },
});

export const refuseSubscription = protectedMutation({
  args: {},
  async handler(ctx) {
    const webSubscription = await ctx.db
      .query("webSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .first();
    if (
      typeof ctx.user.notificationChannels?.push === "undefined" ||
      !webSubscription
    ) {
      await ctx.db.patch("users", ctx.user._id, {
        notificationChannels: {
          ...ctx.user.notificationChannels,
          push: false,
        },
      });
    }
    return "success";
  },
});
