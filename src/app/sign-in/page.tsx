import { SignInForm } from "@/components/auth/sign-in-form";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { WorkOS } from "@workos-inc/node";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";

const workos = new WorkOS(process.env.WORKOS_API_KEY);

interface SignInPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirect: redirectPath } = await searchParams;
  const { user } = await withAuth();

  if (user) {
    return redirect(redirectPath ?? "/", RedirectType.replace);
  }

  // Create the state parameter in the format WorkOS AuthKit expects
  let state: string | undefined;
  if (redirectPath) {
    const stateObject = {
      returnPathname: redirectPath,
    };
    state = Buffer.from(JSON.stringify(stateObject)).toString("base64");
  }

  const googleOAuthUrl = workos.userManagement.getAuthorizationUrl({
    clientId: z.string().parse(process.env.WORKOS_CLIENT_ID),
    provider: "GoogleOAuth",
    redirectUri: z.string().parse(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI),
    state,
  });

  const appleOAuthUrl = workos.userManagement.getAuthorizationUrl({
    clientId: z.string().parse(process.env.WORKOS_CLIENT_ID),
    provider: "AppleOAuth",
    redirectUri: z.string().parse(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI),
    state,
  });

  return (
    <SignInForm
      googleOAuthUrl={googleOAuthUrl}
      appleOAuthUrl={appleOAuthUrl}
      redirectPath={redirectPath}
    />
  );
}
