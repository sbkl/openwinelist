import z from "zod";
import {
  notificationChannelSchema,
  notificationSubscriptionsSchema,
} from "./notifications";
import { zid } from "./zid";

export const userRoleSchema = z.enum(["admin", "user"]);
export const userStatusSchema = z.enum(["active", "suspended"]);

export const userSchema = z.object({
  authId: z.string().optional(),
  status: userStatusSchema,
  email: z.string(),
  name: z.string(),
  roles: z.array(userRoleSchema),
  primaryVenueId: zid("venues").optional(),
  timezone: z.string().optional(),
  notificationChannels: notificationChannelSchema,
  notificationSubscriptions: notificationSubscriptionsSchema.optional(),
  notificationTime: z.number().optional(),
  notificationDue: z.number().optional(),
  rolesUpdatedAt: z.number().optional(),
  rolesUpdateReason: z.string().optional(),
});

export type AuthKitUser = {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  externalId?: null | string;
  firstName?: null | string;
  id: string;
  lastName?: null | string;
  lastSignInAt?: null | string;
  locale?: null | string;
  metadata: Record<string, unknown>;
  profilePictureUrl?: null | string;
  updatedAt: string;
};
