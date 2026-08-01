import { organisationSchema } from "../../schemas/organisations";
import { ZTable } from "../lib/schemaHelpers";

export const Organisations = ZTable("organisations", organisationSchema);
