import { BorderTrail } from "@/components/ui/border-trail";
import Image from "next/image";

interface LoadingPageProps {
  children: React.ReactNode;
}

export function LoadingPage({ children }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted/20 pt-[20vh] flex justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative w-full border border-border bg-card backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-700 rounded-xl shadow-xl">
          {/* Single clean border trail */}
          <BorderTrail
            // className="bg-linear-to-r from-primary via-accent to-primary"
            style={{
              filter: "drop-shadow(0 0 6px currentColor)",
            }}
            size={80}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "linear",
            }}
          />
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative animate-in fade-in-0 zoom-in-95 duration-500">
                <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-60 animate-pulse" />

                <Image
                  src="/tomatini-logo.svg"
                  alt="Tomatini"
                  width={48}
                  height={48}
                  className="w-16 h-16"
                  priority
                />
              </div>

              {/* Welcome text */}
              <div className="text-center space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Welcome to Tomatini
                </h1>
                <p className="text-muted-foreground text-sm">{children}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
