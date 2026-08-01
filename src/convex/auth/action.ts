import { z } from "zod";
import {
  requestSignInResultSchema,
  signInCodeSchema,
  signInEmailSchema,
  type MobileSession,
  type RevokeSessionResult,
  type WebSession,
} from "../../schemas/auth";
import { internal } from "../_generated/api";
import { env } from "../_generated/server";
import { protectedAction, publicAction } from "../functions";
import { resend } from "../resend";
import { credentialRateLimitKey, ensureAuthRateLimit } from "./rateLimits";
import {
  createMobileWorkOSClient,
  createWebWorkOSClient,
  normalizeWorkOSAuthError,
  toMobileSession,
  toResendCtx,
  toWebSession,
  workosErrorStatus,
} from "./utils";

/**
 * Shared by web and mobile. Returns the same generic success result
 * whether or not the email exists or is authorized, so the public
 * surface never discloses account existence.
 */
export const requestSignIn = publicAction({
  args: { email: signInEmailSchema },
  async handler(ctx, { email }) {
    await ensureAuthRateLimit(ctx, "signInRequest", email);

    const exists = await ctx.runQuery(internal.users.internal.query.exists, {
      email,
    });
    if (!exists) {
      return requestSignInResultSchema.parse({ ok: true });
    }

    try {
      const workos = createWebWorkOSClient();
      const { code } = await workos.userManagement.createMagicAuth({ email });

      await resend.sendEmail(toResendCtx(ctx), {
        from: env.RESEND_EMAIL_FROM,
        to: email,
        subject: `Sign in to ${env.APP_NAME}`,
        text: `
Hello,

Your temporary code to access ${env.APP_NAME} is:

${code}

You can use this code to verify your account and access ${env.APP_NAME}.

This code will expire in 15 minutes.

Best regards,
The ${env.APP_NAME} Team`,
      });
    } catch (error) {
      throw normalizeWorkOSAuthError(
        error,
        "Could not send a sign-in code. Please try again.",
      );
    }

    return requestSignInResultSchema.parse({ ok: true });
  },
});

/**
 * Web verification: authenticates against the web WorkOS application and
 * returns exactly what `saveSession` needs to seal the AuthKit cookie.
 */
export const verifySignIn = publicAction({
  args: { email: signInEmailSchema, code: signInCodeSchema },
  async handler(ctx, { email, code }): Promise<WebSession> {
    await ensureAuthRateLimit(ctx, "signInVerify", email);

    try {
      const workos = createWebWorkOSClient();
      const response = await workos.userManagement.authenticateWithMagicAuth({
        email,
        code,
      });
      return toWebSession(response);
    } catch (error) {
      throw normalizeWorkOSAuthError(error, "Invalid or expired code");
    }
  },
});

/**
 * Mobile verification: authenticates against the mobile WorkOS
 * application and returns the narrow bearer-session result.
 */
export const verifyMobileSignIn = publicAction({
  args: { email: signInEmailSchema, code: signInCodeSchema },
  async handler(ctx, { email, code }): Promise<MobileSession> {
    await ensureAuthRateLimit(ctx, "signInVerify", email);

    try {
      const workos = createMobileWorkOSClient();
      const response = await workos.userManagement.authenticateWithMagicAuth({
        email,
        code,
      });
      return toMobileSession(response);
    } catch (error) {
      throw normalizeWorkOSAuthError(error, "Invalid or expired code");
    }
  },
});

/**
 * Public because the access token may already be expired. The refresh
 * token is the credential; WorkOS rotates it on every use, so the client
 * must always replace its stored copy with the returned one.
 */
export const refreshMobileSession = publicAction({
  args: { refreshToken: z.string().min(1) },
  async handler(ctx, { refreshToken }): Promise<MobileSession> {
    await ensureAuthRateLimit(
      ctx,
      "sessionRefresh",
      await credentialRateLimitKey(refreshToken),
    );

    try {
      const workos = createMobileWorkOSClient();
      const response = await workos.userManagement.authenticateWithRefreshToken(
        { refreshToken },
      );
      return toMobileSession(response);
    } catch (error) {
      throw normalizeWorkOSAuthError(error, "Your session has expired");
    }
  },
});

/**
 * Normal logout path. The session id is derived server-side from the
 * validated JWT (`sid` claim) — never accepted from the client. Logout is
 * idempotent: an already-gone session reports `revoked: true`.
 */
export const revokeMobileSession = protectedAction({
  args: {},
  async handler(ctx): Promise<RevokeSessionResult> {
    const identity = await ctx.auth.getUserIdentity();
    const claims = z.object({ sid: z.string() }).safeParse(identity);
    if (!claims.success) {
      return { revoked: false };
    }

    try {
      const workos = createMobileWorkOSClient();
      await workos.userManagement.revokeSession({
        sessionId: claims.data.sid,
      });
      return { revoked: true };
    } catch (error) {
      const status = workosErrorStatus(error);
      if (status === 404) {
        return { revoked: true };
      }
      throw normalizeWorkOSAuthError(
        error,
        "Could not sign out remotely. Please try again.",
      );
    }
  },
});
