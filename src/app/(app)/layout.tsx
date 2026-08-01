import { WebSubscription } from "@/components/web-subscriptions/web-subscription";
import { UserProvider } from "@/providers/user-provider";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { preloadQuery } from "convex/nextjs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { accessToken } = await withAuth();
    const preloadedUserQuery = await preloadQuery(
      api.users.query.me,
      {},
      { token: accessToken },
    );

    return (
      <UserProvider
        preloadedUserQuery={preloadedUserQuery}
        redirectIfNotFound={true}
      >
        <WebSubscription>{children}</WebSubscription>
      </UserProvider>
    );
  } catch (error) {
    throw error;
  }
}

export function isOfflineError(error: unknown): boolean {
  const messages: string[] = [];

  let current: unknown = error;
  while (current && typeof current === "object") {
    if ("message" in current && typeof current.message === "string") {
      messages.push(current.message);
    }

    if ("code" in current && typeof current.code === "string") {
      messages.push(current.code);
    }

    current = "cause" in current ? current.cause : undefined;
  }

  return messages.some((message) =>
    /fetch failed|network|offline|timeout|etimedout|enotfound|eai_again|econnrefused|econnreset/i.test(
      message,
    ),
  );
}
