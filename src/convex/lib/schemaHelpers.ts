import { defineTable, type TableDefinition } from "convex/server";
import { v, type Validator, type GenericId } from "convex/values";
import {
  zodToConvex,
  type ConvexValidatorFromZod,
} from "convex-helpers/server/zod4";
import type { z } from "zod";

/**
 * Helper to define a table from a Zod validator.
 * @param name - The name of the table.
 * @param validator - The Zod validator for the table. z.object({}) or z.union(z.object({}), z.object({})...)
 * @returns A object with the table definition, the document validator, and the system fields.
 * @example
 * const Users = ZTable("users", userSchema);
 * Users.table.index("email", ["email"]);
 * Users.table.index("name", ["name"]);
 */
export function ZTable<TableName extends string, Z extends z.ZodTypeAny>(
  name: TableName,
  validator: Z,
): {
  name: TableName;
  table: TableDefinition<ConvexValidatorFromZod<Z, "required">>;
  // biome-ignore lint/suspicious/noExplicitAny: Convex Validator requires erased generic parameters
  doc: Validator<any, any, any>;
  withoutSystemFields: ConvexValidatorFromZod<Z, "required">;
  // biome-ignore lint/suspicious/noExplicitAny: Convex Validator requires erased generic parameters
  withSystemFields: Validator<any, any, any>;
  systemFields: {
    _id: Validator<GenericId<TableName>>;
    _creationTime: Validator<number>;
  };
  _id: Validator<GenericId<TableName>>;
} {
  const _id = v.id(name);
  const systemFields = {
    _id,
    _creationTime: v.number(),
  };

  // biome-ignore lint/suspicious/noExplicitAny: zod-to-convex cannot preserve this transformed validator type
  const convexValidator = zodToConvex(validator) as any;

  // Check if it's a union validator (has members)
  if ("members" in convexValidator && convexValidator.members) {
    const members = convexValidator.members;
    // biome-ignore lint/suspicious/noExplicitAny: zod-to-convex does not expose union member types
    const membersWithSystem = members.map((member: any) => {
      // Ensure the member is an object validator to mix in system fields
      if (member.fields) {
        return v.object({ ...member.fields, ...systemFields });
      }
      return member;
    });

    const doc = v.union(membersWithSystem[0], ...membersWithSystem.slice(1));
    const table = defineTable(convexValidator);

    return {
      name,
      // biome-ignore lint/suspicious/noExplicitAny: the Zod-derived table type cannot express the transformed validator
      table: table as any,
      doc,
      withoutSystemFields: convexValidator,
      withSystemFields: doc,
      systemFields,
      _id,
    };
  }
  if ("fields" in convexValidator && convexValidator.fields) {
    // It's an object validator
    const fields = convexValidator.fields;
    const table = defineTable(fields);

    const withSystemFields = {
      ...fields,
      ...systemFields,
    };

    return {
      name,
      // biome-ignore lint/suspicious/noExplicitAny: the Zod-derived table type cannot express the transformed validator
      table: table as any,
      doc: v.object(withSystemFields),
      withoutSystemFields: fields,
      withSystemFields,
      systemFields,
      _id,
    };
  }

  throw new Error("Invalid validator");
}
