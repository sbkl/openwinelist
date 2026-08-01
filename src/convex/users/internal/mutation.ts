import { userRoleSchema, userStatusSchema } from "../../../schemas/users";
import { zid } from "../../../schemas/zid";
import { z } from "zod";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { internalMutation } from "../../functions";

const normalizedEmail = z
  .email()
  .transform((value) => value.trim().toLowerCase());
const normalizedName = z.string().trim().min(1).max(200);

function userResult<TUserId extends string>(user: {
  _id: TUserId;
  authId?: string;
  email: string;
  name: string;
  roles: ("admin" | "user")[];
  status: "active" | "suspended";
}) {
  return {
    id: user._id,
    authId: user.authId,
    email: user.email,
    name: user.name,
    roles: user.roles,
    status: user.status,
  };
}

export async function reserveUserRecord(
  ctx: MutationCtx,
  args: {
    userId?: Id<"users">;
    email: string;
    name: string;
    roles: ("admin" | "user")[];
  },
) {
  const email = args.email.trim().toLowerCase();
  const name = args.name.trim();
  const byEmail = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();
  const requested = args.userId ? await ctx.db.get("users", args.userId) : null;
  if (args.userId && !requested) throw new Error("USER_NOT_FOUND");
  if (byEmail && byEmail._id !== requested?._id) {
    const retryRoles = Array.from(new Set(args.roles));
    const samePendingReservation =
      !args.userId &&
      !byEmail.authId &&
      byEmail.name === name &&
      byEmail.roles.length === retryRoles.length &&
      byEmail.roles.every((role) => retryRoles.includes(role));
    if (!samePendingReservation) {
      throw new Error("USER_EMAIL_COLLISION");
    }
    return userResult(byEmail);
  }
  if (requested) {
    const roles = Array.from(new Set(args.roles));
    await ctx.db.patch("users", requested._id, {
      email,
      name,
      roles,
      status: requested.status,
    });
    return userResult({ ...requested, email, name, roles });
  }
  const userId = await ctx.db.insert("users", {
    email,
    name,
    roles: Array.from(new Set(args.roles)),
    status: "active",
    notificationChannels: { email: true, push: true },
  });
  const user = await ctx.db.get("users", userId);
  if (!user) throw new Error("USER_CREATE_FAILED");
  return userResult(user);
}

export const reserveUser = internalMutation({
  args: {
    userId: zid("users").optional(),
    email: normalizedEmail,
    name: normalizedName,
    roles: z.array(userRoleSchema).min(1),
  },
  async handler(ctx, args) {
    return await reserveUserRecord(ctx, args);
  },
});

export const linkWorkOSUser = internalMutation({
  args: {
    userId: zid("users"),
    workosUserId: z.string().min(1),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get("users", args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.authId && user.authId !== args.workosUserId) {
      throw new Error("USER_LOCAL_IDENTITY_COLLISION");
    }
    const byAuthId = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.workosUserId))
      .unique();
    if (byAuthId && byAuthId._id !== user._id) {
      throw new Error("USER_WORKOS_IDENTITY_COLLISION");
    }
    if (user.authId !== args.workosUserId) {
      await ctx.db.patch("users", user._id, {
        authId: args.workosUserId,
      });
    }
    return userResult({ ...user, authId: args.workosUserId });
  },
});

export const updateUserProfile = internalMutation({
  args: {
    userId: zid("users"),
    email: normalizedEmail,
    name: normalizedName,
  },
  async handler(ctx, args) {
    const user = await ctx.db.get("users", args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    const byEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (byEmail && byEmail._id !== user._id) {
      throw new Error("USER_EMAIL_COLLISION");
    }
    await ctx.db.patch("users", user._id, {
      email: args.email,
      name: args.name,
      status: user.status,
    });
    return userResult({ ...user, email: args.email, name: args.name });
  },
});

export const setUserStatus = internalMutation({
  args: {
    userId: zid("users"),
    status: userStatusSchema,
    requestedByUserId: zid("users").optional(),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get("users", args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (args.requestedByUserId) {
      const actor = await ctx.db.get("users", args.requestedByUserId);
      if (
        !actor ||
        actor.status !== "active" ||
        !actor.roles.includes("admin")
      ) {
        throw new Error("ADMIN_ACCESS_REQUIRED");
      }
      if (args.status === "suspended" && actor._id === user._id) {
        throw new Error("ADMIN_SELF_SUSPENSION_FORBIDDEN");
      }
    }
    if (
      args.status === "suspended" &&
      user.status === "active" &&
      user.roles.includes("admin")
    ) {
      const activeUsers = await ctx.db
        .query("users")
        .withIndex("status", (q) => q.eq("status", "active"))
        .take(1_000);
      const hasOtherActiveAdmin = activeUsers.some(
        (candidate) =>
          candidate._id !== user._id && candidate.roles.includes("admin"),
      );
      if (!hasOtherActiveAdmin) {
        throw new Error("LAST_ACTIVE_ADMIN_REQUIRED");
      }
    }
    if (user.status !== args.status) {
      await ctx.db.patch("users", user._id, { status: args.status });
    }
    return userResult({ ...user, status: args.status });
  },
});

export const confirmWorkOSUser = internalMutation({
  args: {
    userId: zid("users"),
    workosUserId: z.string().min(1),
    email: normalizedEmail,
    name: normalizedName,
  },
  async handler(ctx, args) {
    const user = await ctx.db.get("users", args.userId);
    if (!user) return { status: "ignored" as const };
    if (user.authId && user.authId !== args.workosUserId) {
      throw new Error("USER_LOCAL_IDENTITY_COLLISION");
    }
    const byAuthId = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.workosUserId))
      .unique();
    if (byAuthId && byAuthId._id !== user._id) {
      throw new Error("USER_WORKOS_IDENTITY_COLLISION");
    }
    const byEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (byEmail && byEmail._id !== user._id) {
      throw new Error("USER_EMAIL_COLLISION");
    }
    await ctx.db.patch("users", user._id, {
      authId: args.workosUserId,
      email: args.email,
      name: args.name,
    });
    return { status: "confirmed" as const, userId: user._id };
  },
});

export const suspendDeletedWorkOSUser = internalMutation({
  args: {
    userId: zid("users"),
    workosUserId: z.string().min(1),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get("users", args.userId);
    if (!user || user.authId !== args.workosUserId) {
      return { status: "ignored" as const };
    }
    await ctx.db.patch("users", user._id, { status: "suspended" });
    return { status: "suspended" as const, userId: user._id };
  },
});
