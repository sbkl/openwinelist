"use client";

import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import { getFunctionName } from "convex/server";
import { useAction as useConvexAction } from "convex/react";
import { ConvexError } from "convex/values";

export function useActionQuery<Action extends FunctionReference<"action">>(
  action: Action,
  args: FunctionArgs<Action>,
  options: Omit<
    UseQueryOptions<FunctionReturnType<Action>, Error>,
    "queryKey" | "queryFn"
  > = {},
): Omit<UseQueryResult<FunctionReturnType<Action>, Error>, "error"> & {
  error?: string | null;
} {
  const runAction = useConvexAction(action);
  const { error, ...result } = useTanstackQuery({
    queryKey: ["convexAction", getFunctionName(action), args],
    queryFn: async () => await runAction(args),
    ...options,
  });
  const errorMessage = error
    ? error instanceof ConvexError && typeof error.data === "string"
      ? error.data
      : error.message
    : null;

  return { ...result, error: errorMessage };
}
