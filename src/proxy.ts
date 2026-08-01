import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import { type NextRequest } from "next/server";

const unauthenticatedPaths = [
  "/",
  "/sign-in",
  "/sign-in/redirect",
  "/api/auth/callback",
  "/api/auth/sign-in",
  "/sign-out",
  "/manifest.webmanifest",
  "/manifest.json",
  "/assets",
  "/tomatini-logo.svg",
];

function isPathAllowed(pathname: string, allowedPaths: string[]): boolean {
  return allowedPaths.some((path) => {
    // Handle exact matches
    if (path === pathname) {
      return true;
    }

    // Handle wildcard patterns like /api/:path*
    if (path.includes(":path*")) {
      const basePath = path.replace("/:path*", "");
      return pathname.startsWith(`${basePath}/`) || pathname === basePath;
    }

    // Handle prefix matches
    if (pathname.startsWith(`${path}/`)) {
      return true;
    }

    return false;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const { session, headers: authkitHeaders } = await authkit(request, {
    debug: true,
    eagerAuth: true,
    redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/sign-in`,
  });

  // If path is in unauthenticatedPaths, allow access regardless of session status
  if (isPathAllowed(pathname, unauthenticatedPaths)) {
    return handleAuthkitProxy(request, authkitHeaders);
  }

  // For protected paths, check if user is authenticated
  if (!session?.user) {
    return handleAuthkitProxy(request, authkitHeaders, {
      redirect: "/sign-in",
    });
  }

  // User is authenticated, allow access
  return handleAuthkitProxy(request, authkitHeaders);
}

export const config = {
  matcher: [
    // Explicitly include document routes used by server components calling withAuth()
    // "/b/:path*",
    // AuthKit docs recommendation: run on all routes except public/static assets.
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|manifest\\.json|assets/|tomatini-logo\\.svg).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

export default proxy;
