import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

/**
 * Application-level limits for the public auth surface. Emails, codes,
 * and refresh tokens are credentials; these limits bound guessing and
 * abuse before any WorkOS or Resend call happens.
 */
export const authRateLimiter = new RateLimiter(components.rateLimiter, {
  // Codes sent per email address.
  signInRequest: { kind: "token bucket", rate: 3, period: 5 * MINUTE },
  // Verification attempts per email address (stricter: six-digit code guessing).
  signInVerify: { kind: "token bucket", rate: 6, period: 15 * MINUTE },
  // Refresh calls per token digest; normal clients rotate far less often.
  sessionRefresh: { kind: "token bucket", rate: 20, period: 15 * MINUTE },
});

type AuthRateLimitName = "signInRequest" | "signInVerify" | "sessionRefresh";

export async function ensureAuthRateLimit(
  ctx: ActionCtx,
  name: AuthRateLimitName,
  key: string,
): Promise<void> {
  const { ok } = await authRateLimiter.limit(ctx, name, { key });
  if (!ok) {
    throw new ConvexError("Too many attempts. Please try again later.");
  }
}

/**
 * Digest a credential (e.g. a refresh token) so it can be used as a rate
 * limit key without persisting the credential value itself.
 */
export async function credentialRateLimitKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
