"use client";

import { Id, TableNames } from "@/convex/_generated/dataModel";
import {
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

function getSingularParamName(tableName: TableNames): string {
  const singular = tableName.endsWith("ies")
    ? `${tableName.slice(0, -3)}y`
    : tableName.slice(0, -1);

  return `${singular}Id`;
}

export function useParams(key: string) {
  const params = useNextParams();
  const value = params[key];

  return typeof value === "string" ? value : undefined;
}

export function useParamsOrThrow(key: string) {
  const params = useNextParams();
  const value = params[key];

  if (typeof value !== "string") {
    throw new Error(`Param ${key} not found`);
  }

  return value;
}

export function useParamsId<T extends TableNames>(
  tableName: T,
  options: {
    required?: boolean;
  } = {},
) {
  const params = useNextParams();
  const value = getSingularParamName(tableName);
  if (options.required && typeof params[value] !== "string") {
    throw new Error(`${value} is required`);
  }
  return params[value] as Id<T> | undefined;
}

export function useParamsIdOrThrow<T extends TableNames>(tableName: T) {
  const params = useNextParams();
  const value = getSingularParamName(tableName);
  if (typeof params[value] !== "string") {
    throw new Error(`${value} is required`);
  }
  return params[value] as Id<T>;
}

export function useSearchParams(key: string) {
  const params = useNextSearchParams();
  const value = params.get(key);

  return typeof value === "string" ? value : undefined;
}

export function useSearchParamsOrThrow(key: string) {
  const params = useNextSearchParams();
  const value = params.get(key);
  if (typeof value !== "string") {
    throw new Error(`Search param ${key} not found`);
  }
  return value;
}
