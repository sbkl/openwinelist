"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import { useAppForm } from "@/components/ui/form";
import z from "zod";
import { Button } from "@/components/ui/button";
// import { Separator } from "@tomatini/ui/components/separator";
import { useAction } from "@/hooks/use-action";
import { api } from "@/convex/_generated/api";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Spinner } from "@/components/ui/spinner";

interface SignInFormProps {
  googleOAuthUrl: string;
  appleOAuthUrl: string;
  redirectPath?: string;
}

const emailFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

const codeFormSchema = z.object({
  email: z.string(),
  code: z.string().length(6, "Invalid code"),
});

export function SignInForm({
  // googleOAuthUrl,
  // appleOAuthUrl,
  redirectPath,
}: SignInFormProps) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [redirecting, setRedirecting] = React.useState(false);

  const requestSignIn = useAction(api.auth.action.requestSignIn, {
    onSuccess: (_data, variables) => {
      setStep("code");
      codeForm.setFieldValue("email", variables.email);
      toast.success("Code sent to email. Please check your inbox.");
    },
    onError: (message) => {
      setFormFieldError("email", message);
      toast.error(message);
    },
  });

  const signIn = useTanstackMutation<
    void,
    Error,
    { email: string; code: string }
  >({
    mutationFn: async (args) => {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(args),
      });

      if (!res.ok) {
        throw new Error("Failed to sign in");
      }
    },
    onSuccess: async () => {
      setRedirecting(true);

      await refreshAuth();

      toast.success("Code verified. You are now signed in.");

      const redirectUrl = redirectPath
        ? `/sign-in/redirect?redirect=${encodeURIComponent(redirectPath)}`
        : "/sign-in/redirect";

      router.replace(redirectUrl);
    },
    onError: () => {
      toast.error("Failed to sign in. Please try again.");
      setRedirecting(false);
      setFormFieldError("code", "Code could not be verified");
    },
  });

  const emailForm = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailFormSchema,
    },
    onSubmit: async (values) => {
      requestSignIn.mutate({ email: values.value.email });
    },
  });

  const codeForm = useAppForm({
    defaultValues: {
      email: "",
      code: "",
    },
    validators: {
      onSubmit: codeFormSchema,
    },
    onSubmit: async (values) => {
      signIn.mutate({
        email: emailForm.state.values.email,
        code: values.value.code,
      });
    },
  });

  function setFormFieldError(field: "email" | "code", error: string) {
    if (field === "email") {
      emailForm.setFieldMeta("email", (meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onSubmit: error },
      }));
    }

    if (field === "code") {
      codeForm.setFieldMeta("code", (meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onSubmit: error },
      }));
    }
  }

  return (
    <div className="relative flex min-h-svh items-start justify-center overflow-hidden bg-background px-6 pt-[20vh] pb-12">
      <FieldSet className="max-w-sm w-[306px]">
        <div className="flex flex-col items-center justify-center">
          {/* <Logo className="size-14 border-none p-0 shadow-none" /> */}
          <div className="flex flex-col items-center justify-center gap-2">
            <FieldLegend>
              <span className="text-3xl font-bold tracking-tight">
                Tomatini
              </span>
            </FieldLegend>
            <FieldDescription>Sign in to your account</FieldDescription>
          </div>
        </div>

        {step === "email" ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                emailForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <FieldGroup>
                  <emailForm.AppField name="email">
                    {(field) => (
                      <field.TextField
                        name="email"
                        label="Email"
                        disabled={requestSignIn.isPending}
                      />
                    )}
                  </emailForm.AppField>
                </FieldGroup>
                <Field>
                  <Button type="submit" disabled={requestSignIn.isPending}>
                    {requestSignIn.isPending ? (
                      <Spinner className="size-4" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            {/* {requestSignIn.isPending ? null : (
              <>
                <div className="relative">
                  <Separator className="my-6" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground text-sm">
                    Or Continue with
                  </span>
                </div>
                <a
                  href={googleOAuthUrl}
                  className="inline-flex h-8 w-full items-center justify-center gap-3 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <GoogleIcon />
                  Google
                </a>
                <a
                  href={appleOAuthUrl}
                  className="inline-flex h-8 w-full items-center justify-center gap-3 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <AppleIcon />
                  Apple
                </a>
              </>
            )} */}
          </>
        ) : null}

        {step === "code" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              codeForm.handleSubmit();
            }}
          >
            <FieldGroup>
              <FieldGroup>
                <codeForm.AppField name="code">
                  {(field) => (
                    <field.OTPField
                      label="OTP"
                      disabled={signIn.isPending || redirecting}
                      onComplete={codeForm.handleSubmit}
                    />
                  )}
                </codeForm.AppField>
              </FieldGroup>
              <Field>
                <Button
                  type="submit"
                  disabled={signIn.isPending || redirecting}
                >
                  {signIn.isPending || redirecting ? (
                    <Spinner className="size-4" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        ) : null}
        <p className="text-xs leading-relaxed text-muted-foreground/70 text-center">
          By continuing, you agree to Tomatini&apos;s Terms of Service and
          Privacy Policy.
        </p>
      </FieldSet>
    </div>
  );
}

// function GoogleIcon() {
//   return (
//     <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
//       <path
//         fill="#4285F4"
//         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//       />
//       <path
//         fill="#34A853"
//         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//       />
//       <path
//         fill="#FBBC05"
//         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//       />
//       <path
//         fill="#EA4335"
//         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//       />
//     </svg>
//   );
// }

// function AppleIcon() {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="20"
//       height="20"
//       viewBox="0 0 814 1000"
//       fill="currentColor"
//       role="img"
//       aria-label="Apple"
//     >
//       <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.6-105.6-208.7-105.6-329.1 0-193.6 125.8-296.5 249.6-296.5 65.7 0 120.6 43.2 161.9 43.2 39.2 0 100.4-45.8 174.7-45.8 28.2 0 129.6 2.6 196.7 99.6zm-270-181.2c31.9-38.5 54.6-92 54.6-145.5 0-7.4-.7-14.8-2-21.9-52.1 1.9-113.5 34.7-150.7 78.5-26.5 30.5-55.2 84-55.2 138.2 0 8.1.9 16.2 1.3 18.8 2.1.3 5.5.7 8.8.7 47.1 0 105.7-31.2 143.2-68.8z" />
//     </svg>
//   );
// }
