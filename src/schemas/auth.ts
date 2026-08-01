import { z } from "zod";
import { workosUserSchema } from "./workos";

export const signInEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address"));

export const signInCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Invalid code");

export const requestSignInResultSchema = z.object({
  ok: z.literal(true),
});

export const impersonatorSchema = z.object({
  email: z.string(),
  reason: z.string().nullable(),
});

/**
 * Web session result: exactly what `saveSession` from
 * `@workos-inc/authkit-nextjs` needs to seal the cookie — nothing more.
 */
export const webSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: workosUserSchema,
  impersonator: impersonatorSchema.optional(),
});

/**
 * Mobile session result: bearer credentials plus the WorkOS session id
 * (from the access token `sid` claim) needed for later revocation.
 */
export const mobileSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  sessionId: z.string(),
});

export const revokeSessionResultSchema = z.object({
  revoked: z.boolean(),
});

export type WebSession = z.infer<typeof webSessionSchema>;
export type MobileSession = z.infer<typeof mobileSessionSchema>;
export type RevokeSessionResult = z.infer<typeof revokeSessionResultSchema>;
