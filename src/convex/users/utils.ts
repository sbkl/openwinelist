import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { ActionCtx, QueryCtx } from "../_generated/server";
import { authKit } from "../auth";
import { internal } from "../_generated/api";
import type { AuthKitUser } from "../../schemas/users";

export type User = Omit<Doc<"users">, "authId"> & {
  authId: string;
  authKit: AuthKitUser;
};

export async function findUserByAuthId(
  ctx: QueryCtx,
  authId: string,
): Promise<User | null> {
  // Here you can add additional info about the user if needed like profile, roles, etc.
  // So it is shared with all functions fetching the user.
  const authUser = await authKit.getAuthUser(ctx);
  if (!authUser) return null;
  const convexUser = await ctx.db
    .query("users")
    .withIndex("authId", (q) => q.eq("authId", authId))
    .unique();

  if (!convexUser) throw new ConvexError("User not found");

  return {
    ...convexUser,
    authId,
    authKit: authUser,
  };
}

export async function findCurrentUser(
  ctx: ActionCtx | QueryCtx,
): Promise<User | null> {
  const authUser = await authKit.getAuthUser(ctx);
  if (authUser) {
    if (isActionCtx(ctx)) {
      const convexUser = await ctx.runQuery(
        internal.users.internal.query.findByAuthId,
        {
          authId: authUser.id,
        },
      );
      if (!convexUser) throw new ConvexError("User not found");
      return {
        ...convexUser,
        authId: authUser.id,
        authKit: authUser,
      };
    }
    const convexUser = await findUserByAuthId(ctx, authUser.id);
    if (!convexUser) throw new ConvexError("User not found");
    return {
      ...convexUser,
      authKit: authUser,
    };
  }
  return null;
}

export async function getCurrentUser(
  ctx: ActionCtx | QueryCtx,
): Promise<NonNullable<User>> {
  const userRecord = await findCurrentUser(ctx);
  if (!userRecord) throw new ConvexError("Authentication required");
  return userRecord;
}

/**
 * Check if context is an ActionCtx (has runQuery method)
 */
function isActionCtx(ctx: ActionCtx | QueryCtx): ctx is ActionCtx {
  return "runQuery" in ctx;
}
