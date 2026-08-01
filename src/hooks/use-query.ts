"use client";

import { convexQuery } from "@convex-dev/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import { ConvexError } from "convex/values";

export function useQuery<
  Query extends FunctionReference<"query">,
  Args extends FunctionArgs<Query> | "skip",
>(
  query: Query,
  args: Args,
  options: Omit<
    UseQueryOptions<FunctionReturnType<Query>, Error>,
    "queryKey" | "queryFn" | "staleTime"
  > = {},
): Omit<UseQueryResult<FunctionReturnType<Query>, Error>, "error"> & {
  error?: string | null;
} {
  const { error, ...rest } = useTanstackQuery({
    ...options,
    ...convexQuery(query, args),
  } as UseQueryOptions<FunctionReturnType<Query>, Error>);
  const errorMessage = error
    ? error instanceof ConvexError && typeof error.data === "string"
      ? error.data
      : error.message
    : null;
  return {
    ...rest,
    error: errorMessage,
  };
}
