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

import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { useAction as useConvexAction } from "convex/react";
import { ConvexError } from "convex/values";

export function useAction<
  Action extends FunctionReference<"action">,
  Args extends FunctionArgs<Action>,
  ReturnType extends FunctionReturnType<Action>,
>(
  action: Action,
  options?: Omit<UseMutationOptions<ReturnType, Error, Args>, "onError"> & {
    onError?: (message: string) => void;
  },
): UseMutationResult<ReturnType, Error, Args> {
  const convexAction = useConvexAction(action);
  const { onError, ...rest } = options ?? {};
  return useTanstackMutation<ReturnType, Error, Args>({
    mutationFn: async (args) => {
      return await convexAction(args);
    },
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
