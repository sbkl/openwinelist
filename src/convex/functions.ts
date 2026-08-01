import { ConvexError } from "convex/values";
import * as ConvexBase from "./_generated/server";
import {
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import type { Rules } from "convex-helpers/server/rowLevelSecurity";
import { findCurrentUser } from "./users/utils";
import type { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx } from "convex-helpers/server/customFunctions";
import {
  zCustomQuery,
  zCustomMutation,
  zCustomAction,
} from "convex-helpers/server/zod4";

export const triggers = new Triggers<DataModel>();

async function rlsRules(ctx: ConvexBase.QueryCtx) {
  const user = await findCurrentUser(ctx);
  return {
    rules: {} satisfies Rules<ConvexBase.QueryCtx, DataModel>,
    user,
  };
}

async function rlsRulesInternal(_ctx: ConvexBase.QueryCtx) {
  return {
    rules: {} satisfies Rules<ConvexBase.QueryCtx, DataModel>,
  };
}

export const publicQuery = zCustomQuery(
  ConvexBase.query,
  customCtx(async (ctx) => {
    const { rules, user } = await rlsRules(ctx);
    return {
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user,
    };
  }),
);

export const protectedQuery = zCustomQuery(
  ConvexBase.query,
  customCtx(async (ctx) => {
    const { rules, user } = await rlsRules(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    return {
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user,
    };
  }),
);

export const adminQuery = zCustomQuery(
  ConvexBase.query,
  customCtx(async (ctx) => {
    const { rules, user } = await rlsRules(ctx);
    if (!user?.roles?.includes("admin")) {
      throw new ConvexError("Admin access is required");
    }
    return {
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user,
    };
  }),
);

export const internalQuery = zCustomQuery(
  ConvexBase.internalQuery,
  customCtx(async (ctx) => {
    const { rules } = await rlsRulesInternal(ctx);
    return { db: wrapDatabaseReader(ctx, ctx.db, rules) };
  }),
);

export const publicMutation = zCustomMutation(
  ConvexBase.mutation,
  customCtx(async (ctx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules, user } = await rlsRules(withTriggersCtx);
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user,
    };
  }),
);

export const protectedMutation = zCustomMutation(
  ConvexBase.mutation,
  customCtx(async (ctx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules, user } = await rlsRules(withTriggersCtx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user,
    };
  }),
);

export const adminMutation = zCustomMutation(
  ConvexBase.mutation,
  customCtx(async (ctx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules, user } = await rlsRules(withTriggersCtx);
    if (!user?.roles?.includes("admin")) {
      throw new ConvexError("Admin access is required");
    }
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user,
    };
  }),
);

export const internalMutation = zCustomMutation(
  ConvexBase.internalMutation,
  customCtx(async (ctx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules } = await rlsRulesInternal(withTriggersCtx);
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
    };
  }),
);

export const publicAction = zCustomAction(
  ConvexBase.action,
  customCtx(async (ctx) => {
    const user = await findCurrentUser(ctx);
    return {
      user,
    };
  }),
);

export const internalAction = zCustomAction(
  ConvexBase.internalAction,
  customCtx(async () => {
    return {};
  }),
);

export const protectedAction = zCustomAction(
  ConvexBase.action,
  customCtx(async (ctx) => {
    const user = await findCurrentUser(ctx);
    if (!user) throw new ConvexError("Unauthorized");
    return {
      user,
    };
  }),
);
