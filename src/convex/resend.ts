import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { env } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
  // testMode: env.ENVIRONMENT === "development",
  testMode: false,
  apiKey: env.RESEND_API_KEY,
});
