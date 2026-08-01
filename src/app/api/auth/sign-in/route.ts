import { saveSession } from "@workos-inc/authkit-nextjs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, code } = z
      .object({
        email: z.string(),
        code: z.string(),
      })
      .parse(json);

    const session = await fetchAction(api.auth.action.verifySignIn, {
      email,
      code,
    });

    await saveSession(session, req);

    return NextResponse.json({ ok: true });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side diagnostics are intentional
    console.error("sign-in verification failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
