/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_action from "../auth/action.js";
import type * as auth_rateLimits from "../auth/rateLimits.js";
import type * as auth_utils from "../auth/utils.js";
import type * as functions from "../functions.js";
import type * as lib_schemaHelpers from "../lib/schemaHelpers.js";
import type * as organisations_table from "../organisations/table.js";
import type * as producers_table from "../producers/table.js";
import type * as resend from "../resend.js";
import type * as users_internal_mutation from "../users/internal/mutation.js";
import type * as users_internal_query from "../users/internal/query.js";
import type * as users_mutation from "../users/mutation.js";
import type * as users_query from "../users/query.js";
import type * as users_table from "../users/table.js";
import type * as users_utils from "../users/utils.js";
import type * as webSubscriptions_internal_action from "../webSubscriptions/internal/action.js";
import type * as webSubscriptions_internal_query from "../webSubscriptions/internal/query.js";
import type * as webSubscriptions_mutation from "../webSubscriptions/mutation.js";
import type * as webSubscriptions_table from "../webSubscriptions/table.js";
import type * as wines_table from "../wines/table.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/action": typeof auth_action;
  "auth/rateLimits": typeof auth_rateLimits;
  "auth/utils": typeof auth_utils;
  functions: typeof functions;
  "lib/schemaHelpers": typeof lib_schemaHelpers;
  "organisations/table": typeof organisations_table;
  "producers/table": typeof producers_table;
  resend: typeof resend;
  "users/internal/mutation": typeof users_internal_mutation;
  "users/internal/query": typeof users_internal_query;
  "users/mutation": typeof users_mutation;
  "users/query": typeof users_query;
  "users/table": typeof users_table;
  "users/utils": typeof users_utils;
  "webSubscriptions/internal/action": typeof webSubscriptions_internal_action;
  "webSubscriptions/internal/query": typeof webSubscriptions_internal_query;
  "webSubscriptions/mutation": typeof webSubscriptions_mutation;
  "webSubscriptions/table": typeof webSubscriptions_table;
  "wines/table": typeof wines_table;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workOSAuthKit: import("@convex-dev/workos-authkit/_generated/component.js").ComponentApi<"workOSAuthKit">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
