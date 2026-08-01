import { z } from "zod";

export const webhookTypeValueSchema = z.union([
  z.literal("organisations"),
  z.literal("users"),
]);

export const organisationDomainStatusValueSchema = z.union([
  z.literal("verified"),
  z.literal("pending"),
  z.literal("failed"),
]);

export const userManagementAuthorizationURLOptionsSchema = z.object({
  clientId: z.string(),
  codeChallenge: z.string().optional(),
  codeChallengeMethod: z.literal("S256").optional(),
  connectionId: z.string().optional(),
  organizationId: z.string().optional(),
  domainHint: z.string().optional(),
  loginHint: z.string().optional(),
  provider: z.string().optional(),
  providerScopes: z.array(z.string()).optional(),
  redirectUri: z.string(),
  state: z.string().optional(),
  screenHint: z.enum(["sign-up", "sign-in"]).optional(),
});

export const workosUserSchema = z.object({
  object: z.literal("user"),
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  profilePictureUrl: z.string().nullable(),
  name: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  lastSignInAt: z.string().nullable(),
  locale: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  externalId: z.string().nullable(),
  metadata: z.record(z.string(), z.string()),
});
