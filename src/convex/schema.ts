import { defineSchema } from "convex/server";
import { Organisations } from "./organisations/table";
import { Producers } from "./producers/table";
import { Wines } from "./wines/table";
import { Users } from "./users/table";
import { WebSubscriptions } from "./webSubscriptions/table";

export default defineSchema({
  users: Users.table
    .index("authId", ["authId"])
    .index("email", ["email"])
    .index("name", ["name"])
    .index("status", ["status"])
    .index("status_name", ["status", "name"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["status"],
    })
    .searchIndex("search_email", {
      searchField: "email",
      filterFields: ["status"],
    }),
  organisations: Organisations.table
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  producers: Producers.table
    .index("by_organisationId", ["organisationId"])
    .index("by_organisationId_and_slug", ["organisationId", "slug"]),

  wines: Wines.table
    .index("by_producerId", ["producerId"])
    .index("by_producerId_and_slug", ["producerId", "slug"])
    .index("by_producerId_and_status", ["producerId", "status"])
    .index("by_producerId_and_type", ["producerId", "type"]),
  webSubscriptions: WebSubscriptions.table.index("userId", ["userId"]),
});
