import z from "zod";
import { zid } from "./zid";

export const producerKind = z.enum([
  "winery",
  "distillery",
  "brewery",
  "cooperage",
  "other",
]);

export const producerStatus = z.enum(["draft", "published", "archived"]);

export const producerSchema = z.object({
  organisationId: zid("organisations"),
  name: z.string(),
  slug: z.string(),
  kind: z.optional(producerKind),
  description: z.optional(z.string()),
  websiteUrl: z.optional(z.string()),
  countryCode: z.optional(z.string()),
  region: z.optional(z.string()),
  foundedYear: z.optional(z.number()),
  status: producerStatus,
});
