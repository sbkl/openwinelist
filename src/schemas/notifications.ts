import { z } from "zod";

export const notificationChannelSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
});

export const notificationTypeValueSchema = z.union([
  z.literal("dueCards"),
  z.literal("newDocumentReady"),
]);

export const notificationSubscriptionsSchema = z.object({
  dueCards: z.boolean(),
  newDocumentReady: z.boolean(),
});
