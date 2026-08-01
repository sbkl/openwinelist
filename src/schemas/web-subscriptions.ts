import z from "zod";
import { zid } from "./zid";

export const webSubscriptionSchema = z.object({
  userId: zid("users"),
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.union([z.number(), z.null()]).optional(),
});
