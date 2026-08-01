import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import type { AuthKitUser } from "../schemas/users";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const authFunctions: AuthFunctions = internal.auth;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
  authFunctions,
});

function workosDisplayName(
  user: Pick<AuthKitUser, "firstName" | "lastName">,
): string {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

export async function authenticationAllowed(
  ctx: Pick<MutationCtx, "db">,
  workosUser: AuthKitUser,
): Promise<boolean> {
  const localUser = await ctx.db
    .query("users")
    .withIndex("authId", (q) => q.eq("authId", workosUser.id))
    .unique();
  return Boolean(
    localUser &&
    localUser.authId === workosUser.id &&
    localUser.status !== "suspended",
  );
}

function exactLocalUserId(
  ctx: Pick<MutationCtx, "db">,
  externalId: string | null | undefined,
): Id<"users"> | null {
  if (!externalId) return null;
  return ctx.db.normalizeId("users", externalId);
}

function warnIgnoredCallback(message: string, workosUserId: string): void {
  // biome-ignore lint/suspicious/noConsole: bounded diagnostic without PII
  console.warn(message, { workosUserSuffix: workosUserId.slice(-8) });
}

async function confirmExactCallback(
  ctx: Pick<MutationCtx, "db" | "runMutation">,
  user: AuthKitUser,
): Promise<void> {
  const userId = exactLocalUserId(ctx, user.externalId);
  if (!userId) {
    warnIgnoredCallback("Ignored unclaimed WorkOS user callback", user.id);
    return;
  }
  const result = await ctx.runMutation(
    internal.users.internal.mutation.confirmWorkOSUser,
    {
      userId,
      workosUserId: user.id,
      email: user.email,
      name: workosDisplayName(user),
    },
  );
  if (result.status === "ignored") {
    warnIgnoredCallback("Ignored unknown WorkOS user callback", user.id);
  }
}

export const { authKitAction } = authKit.actions({
  userRegistration: async (_ctx, _action, response) =>
    response.deny("Account provisioning is required"),
  authentication: async (ctx, action, response) =>
    (await authenticationAllowed(ctx, action.user))
      ? response.allow()
      : response.deny("Account access is unavailable"),
});

export const { authKitEvent } = authKit.events({
  "user.created": async (ctx, event) => {
    await confirmExactCallback(ctx, event.data);
  },
  "user.updated": async (ctx, event) => {
    await confirmExactCallback(ctx, event.data);
  },
  "user.deleted": async (ctx, event) => {
    const userId = exactLocalUserId(ctx, event.data.externalId);
    if (!userId) {
      warnIgnoredCallback(
        "Ignored unclaimed WorkOS user deletion callback",
        event.data.id,
      );
      return;
    }
    await ctx.runMutation(
      internal.users.internal.mutation.suspendDeletedWorkOSUser,
      { userId, workosUserId: event.data.id },
    );
  },
});
