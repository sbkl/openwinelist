import workOSAuthKit from "@convex-dev/workos-authkit/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    APP_NAME: v.string(),
    ENVIRONMENT: v.string(),
    RESEND_API_KEY: v.string(),
    RESEND_EMAIL_FROM: v.string(),
    SITE_URL: v.string(),
    WORKOS_ACTION_SECRET: v.string(),
    WORKOS_API_KEY: v.string(),
    WORKOS_CLIENT_ID: v.string(),
    WORKOS_COOKIE_PASSWORD: v.string(),
    // WORKOS_MOBILE_CLIENT_ID: v.string(),
    WORKOS_WEBHOOK_SECRET: v.string(),
    VAPID_PUBLIC_KEY: v.string(),
    VAPID_PRIVATE_KEY: v.string(),
    VAPID_SUBJECT: v.string(),
  },
});

app.use(workOSAuthKit);
app.use(rateLimiter);
app.use(resend);

export default app;
