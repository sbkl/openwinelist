import z from "zod";
import { protectedMutation } from "../functions";
export const setup = protectedMutation({
  args: {
    timezone: z.string(),
  },
  handler: async (ctx, args) => {
    if (!ctx.user.timezone) {
      await ctx.db.patch("users", ctx.user._id, args);
    }
  },
});
