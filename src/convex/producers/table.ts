import { ZTable } from "../lib/schemaHelpers";
import { producerSchema } from "../../schemas/producers";

export const Producers = ZTable("producers", producerSchema);
