import { z } from "zod";
import { zid } from "./zid";

export const wineType = z.enum([
  "red",
  "white",
  "rose",
  "orange",
  "sparkling",
  "dessert",
  "fortified",
]);

export const wineStatus = z.enum(["draft", "published", "archived"]);

export const wineSchema = z.object({
  producerId: zid("producers"),
  name: z.string(),
  slug: z.string(),
  vintage: z.optional(z.number()),
  type: wineType,
  countryCode: z.optional(z.string()),
  region: z.optional(z.string()),
  subregion: z.optional(z.string()),
  appellation: z.optional(z.string()),
  classification: z.optional(z.string()),
  grapeVarieties: z.optional(z.array(z.string())),
  alcoholByVolume: z.optional(z.number()),
  description: z.optional(z.string()),
  status: wineStatus,
});

export type Wine = z.infer<typeof wineSchema>;
