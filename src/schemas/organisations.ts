import { z } from "zod";

export const organisationStatus = z.enum(["draft", "published", "archived"]);

export const organisationSchema = z.object({
  name: z.string(),
  slug: z.string(),
  legalName: z.optional(z.string()),
  description: z.optional(z.string()),
  websiteUrl: z.optional(z.string()),
  countryCode: z.optional(z.string()),
  status: organisationStatus,
});

export type Organisation = z.infer<typeof organisationSchema>;
