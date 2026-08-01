import { zid as _zid } from "convex-helpers/server/zod4";
import type { z } from "zod";

export type Id<TableName extends string> = string & {
  __tableName: TableName;
};

export const zid = <T extends string>(tableName: T) =>
  _zid(tableName) as unknown as z.ZodCustom<Id<T>, Id<T>>;
