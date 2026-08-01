import { SignInRedirect } from "@/components/auth/signin-redirect";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

interface SignInRedirectPageProps {
  searchParams: Promise<{
    redirect?: string;
    token?: string;
  }>;
}

export default async function SignInRedirectPage({
  searchParams,
}: SignInRedirectPageProps) {
  const { user } = await withAuth();
  if (!user) {
    redirect("/sign-in");
  }

  const { redirect: redirectPath } = await searchParams;

  return <SignInRedirect redirectPath={redirectPath} />;
}
