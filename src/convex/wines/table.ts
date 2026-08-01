import { ZTable } from "../lib/schemaHelpers";
import { wineSchema } from "../../schemas/wines";

export const Wines = ZTable("wines", wineSchema);
