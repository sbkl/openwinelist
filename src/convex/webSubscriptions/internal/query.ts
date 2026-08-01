import { zid } from "../../../schemas/zid";
import { internalQuery } from "../../functions";
import z from "zod";

export const listByUserIds = internalQuery({
  args: {
    userIds: z.array(zid("users")),
  },
  async handler(ctx, { userIds }) {
    const subscriptions = (
      await Promise.all(
        userIds.map(async (userId) => {
          const subscriptions = await ctx.db
            .query("webSubscriptions")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();
          return subscriptions;
        }),
      )
    ).flat();

    return subscriptions;
  },
});
