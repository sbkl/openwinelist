"use client";

import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

import { useConvex, useMutation as useConvexMutation } from "convex/react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { ConvexError } from "convex/values";

export function useMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  options?: Omit<
    UseMutationOptions<
      FunctionReturnType<Mutation>,
      Error,
      FunctionArgs<Mutation>
    >,
    "mutationFn" | "onError"
  > & {
    onError?: (message: string) => void;
  },
): UseMutationResult<
  FunctionReturnType<Mutation>,
  Error,
  FunctionArgs<Mutation>
> {
  const convex = useConvex();
  const { onError, ...rest } = options ?? {};
  return useTanstackMutation<
    FunctionReturnType<Mutation>,
    Error,
    FunctionArgs<Mutation>
  >({
    mutationFn: (args) => convex.mutation(mutation, args),
    ...rest,
    onError: (error) => {
      if (!onError) return;
      const message =
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : error.message;
      onError(message);
    },
  });
}

export function useMutationWithOptimisticUpdate<
  Mutation extends FunctionReference<"mutation">,
>(
  mutation: Mutation,
  options?: Omit<
    UseMutationOptions<
      FunctionReturnType<Mutation>,
      Error,
      FunctionArgs<Mutation>
    >,
    "mutationFn" | "onError"
  > & {
    onError?: (message: string) => void;
  },
) {
  const convexMutation = useConvexMutation(mutation);

  const { onError, ...rest } = options ?? {};
  return useTanstackMutation<
    FunctionReturnType<Mutation>,
    Error,
    FunctionArgs<Mutation>
  >({
    mutationFn: (args) => convexMutation(args),
    ...rest,
    onError: (error) => {
      if (!onError) return;
      const message =
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : error.message;
      onError(message);
    },
  });
}
