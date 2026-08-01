import { WorkOS, type AuthenticationResponse } from "@workos-inc/node";
import { ConvexError } from "convex/values";
import { z } from "zod";
import {
  mobileSessionSchema,
  webSessionSchema,
  type MobileSession,
  type WebSession,
} from "../../schemas/auth";
import { env, type ActionCtx } from "../_generated/server";
import type { resend } from "../resend";

type ResendSendEmailCtx = Parameters<typeof resend.sendEmail>[0];

/**
 * SAFETY: `@convex-dev/resend` bundles Convex types whose `runMutation`
 * signature carries an extra options parameter not present in this
 * repository's `convex` version. The runtime object is the same action
 * context; only the declared signatures differ. Keep this the single
 * place that bridges the two.
 */
export function toResendCtx(ctx: ActionCtx): ResendSendEmailCtx {
  return ctx as unknown as ResendSendEmailCtx;
}

export function createWebWorkOSClient(): WorkOS {
  return new WorkOS({
    apiKey: env.WORKOS_API_KEY,
    clientId: env.WORKOS_CLIENT_ID,
  });
}

export function createMobileWorkOSClient(): WorkOS {
  return new WorkOS({
    apiKey: env.WORKOS_API_KEY,
    clientId: env.WORKOS_CLIENT_ID,
  });
}

const accessTokenClaimsSchema = z.object({
  sid: z.string(),
});

/**
 * Extract the WorkOS session id from an access token we just received
 * directly from WorkOS over TLS. No signature verification is needed on
 * this path — the token is first-party input, not client input.
 */
function extractSessionId(accessToken: string): string {
  const payloadSegment = accessToken.split(".")[1];
  if (!payloadSegment) {
    throw new ConvexError("Authentication failed. Please try again.");
  }
  const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  const claims = accessTokenClaimsSchema.parse(
    JSON.parse(new TextDecoder().decode(bytes)),
  );
  return claims.sid;
}

export function toWebSession(response: AuthenticationResponse): WebSession {
  return webSessionSchema.parse({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: {
      ...response.user,
      name: response.user.firstName
        ? `${response.user.firstName} ${response.user.lastName ?? ""}`
        : null,
    },
    ...(response.impersonator ? { impersonator: response.impersonator } : {}),
  });
}

export function toMobileSession(
  response: AuthenticationResponse,
): MobileSession {
  return mobileSessionSchema.parse({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    sessionId: extractSessionId(response.accessToken),
  });
}

const workosErrorShapeSchema = z.object({
  status: z.number().optional(),
  code: z.string().optional(),
  requestID: z.string().optional(),
});

export function workosErrorStatus(error: unknown): number | undefined {
  const parsed = workosErrorShapeSchema.safeParse(error);
  return parsed.success ? parsed.data.status : undefined;
}

/**
 * Map a WorkOS SDK failure to a user-safe ConvexError, logging only
 * redacted diagnostics (never emails, codes, or token values).
 */
export function normalizeWorkOSAuthError(
  error: unknown,
  invalidCredentialsMessage: string,
): ConvexError<string> {
  const parsed = workosErrorShapeSchema.safeParse(error);
  const status = parsed.success ? parsed.data.status : undefined;
  // biome-ignore lint/suspicious/noConsole: redacted diagnostics are intentional
  console.error("workos_auth_error", {
    name: error instanceof Error ? error.name : "unknown",
    status,
    code: parsed.success ? parsed.data.code : undefined,
    requestID: parsed.success ? parsed.data.requestID : undefined,
  });
  if (status === 429) {
    return new ConvexError("Too many attempts. Please try again later.");
  }
  if (status !== undefined && status >= 400 && status < 500) {
    return new ConvexError(invalidCredentialsMessage);
  }
  return new ConvexError(
    "Authentication is temporarily unavailable. Please try again.",
  );
}
