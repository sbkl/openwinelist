import { zid } from "../../../schemas/zid";
import { ConvexError } from "convex/values";
import z from "zod";
import { internalQuery } from "../../functions";

export const getById = internalQuery({
  args: { userId: zid("users") },
  async handler(ctx, args) {
    return await ctx.db.get("users", args.userId);
  },
});

export const getByAuthId = internalQuery({
  args: { authId: z.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .unique();
    if (!user) throw new ConvexError("User not found");
    return user;
  },
});

export const findByAuthId = internalQuery({
  args: { authId: z.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.authId))
      .unique();
  },
});

export const findByEmail = internalQuery({
  args: { email: z.email() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();
  },
});

export const exists = internalQuery({
  args: { email: z.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();
    return Boolean(user && user.status !== "suspended" && user.authId);
  },
});
