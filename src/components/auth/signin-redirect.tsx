"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { LoadingPage } from "@/components/loading-page";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "@/hooks/use-query";

interface SignInRedirectProps {
  redirectPath?: string;
}

export function SignInRedirect({ redirectPath }: SignInRedirectProps) {
  const { data: user, isPending } = useQuery(api.users.query.me, {});
  const router = useRouter();
  const setup = useMutation(api.users.mutation.setup);
  const hasInitiated = React.useRef(false);

  React.useEffect(() => {
    if (!user || isPending || hasInitiated.current) return;
    hasInitiated.current = true;

    async function init() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await setup.mutateAsync({
        timezone,
      });

      router.replace(redirectPath ?? "/");
    }
    init();
  }, [user, isPending, redirectPath, setup, router]);

  return <LoadingPage>Setting up your workspace...</LoadingPage>;
}
