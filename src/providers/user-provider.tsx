"use client";

import type { api } from "@/convex/_generated/api";
import type { userRoleSchema } from "@/schemas/users";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { redirect } from "next/navigation";
import * as React from "react";
import type z from "zod";

interface UserProviderProps {
  children: React.ReactNode;
  preloadedUserQuery: Preloaded<typeof api.users.query.me>;
  redirectIfNotFound: boolean;
  allowedRoles?: z.infer<typeof userRoleSchema>[];
}

interface UserContextProps {
  user: typeof api.users.query.me._returnType;
}

const UserContext = React.createContext<UserContextProps | undefined>(
  undefined,
);

export function UserProvider({
  children,
  preloadedUserQuery,
  redirectIfNotFound,
  allowedRoles,
}: UserProviderProps) {
  const user = usePreloadedQuery(preloadedUserQuery);

  if (redirectIfNotFound && !user) {
    return redirect("/sign-in");
  }

  if (
    allowedRoles &&
    !allowedRoles.some((role) => user?.roles?.includes(role))
  ) {
    return redirect("/");
  }

  return <UserContext value={{ user }}>{children}</UserContext>;
}

export function useUser() {
  const context = React.use(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function useOptionalUser() {
  return React.use(UserContext);
}
