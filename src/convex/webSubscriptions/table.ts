import { webSubscriptionSchema } from "../../schemas/web-subscriptions";
import { ZTable } from "../lib/schemaHelpers";

export const WebSubscriptions = ZTable(
  "webSubscriptions",
  webSubscriptionSchema,
);
