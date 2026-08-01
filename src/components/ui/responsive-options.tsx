"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ResponsiveOptionsMode = "desktop" | "mobile";

const ResponsiveOptionsContext =
  React.createContext<ResponsiveOptionsMode | null>(null);

function useResponsiveOptionsMode() {
  const mode = React.use(ResponsiveOptionsContext);

  if (!mode) {
    throw new Error(
      "Responsive options components must be used within ResponsiveOptions.",
    );
  }

  return mode;
}

type ResponsiveOptionsProps = Omit<
  React.ComponentProps<typeof Drawer>,
  "children"
> & {
  children: React.ReactNode;
};

function ResponsiveOptions({
  children,
  showSwipeHandle = true,
  ...props
}: ResponsiveOptionsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveOptionsContext value="mobile">
        <Drawer showSwipeHandle={showSwipeHandle} {...props}>
          {children}
        </Drawer>
      </ResponsiveOptionsContext>
    );
  }

  return (
    <ResponsiveOptionsContext value="desktop">
      {children}
    </ResponsiveOptionsContext>
  );
}

function ResponsiveOptionsDesktop({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveOptionsMode();

  if (mode === "mobile") return null;

  return (
    <div
      data-slot="responsive-options-desktop"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function ResponsiveOptionsTrigger({
  ...props
}: React.ComponentProps<typeof DrawerTrigger>) {
  const mode = useResponsiveOptionsMode();

  if (mode === "desktop") return null;

  return <DrawerTrigger data-slot="responsive-options-trigger" {...props} />;
}

function ResponsiveOptionsContent({
  ...props
}: React.ComponentProps<typeof DrawerContent>) {
  const mode = useResponsiveOptionsMode();

  if (mode === "desktop") return null;

  return <DrawerContent data-slot="responsive-options-content" {...props} />;
}

function ResponsiveOptionsHeader({
  ...props
}: React.ComponentProps<typeof DrawerHeader>) {
  return <DrawerHeader data-slot="responsive-options-header" {...props} />;
}

function ResponsiveOptionsTitle({
  ...props
}: React.ComponentProps<typeof DrawerTitle>) {
  return <DrawerTitle data-slot="responsive-options-title" {...props} />;
}

function ResponsiveOptionsDescription({
  ...props
}: React.ComponentProps<typeof DrawerDescription>) {
  return (
    <DrawerDescription data-slot="responsive-options-description" {...props} />
  );
}

function ResponsiveOptionsGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="responsive-options-group"
      className={cn("flex flex-col gap-1 p-4", className)}
      {...props}
    />
  );
}

function ResponsiveOptionsItem({
  className,
  type = "button",
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="responsive-options-item"
      type={type}
      variant={variant}
      className={cn(
        "h-auto min-h-10 w-full justify-start px-3 py-2.5 text-left whitespace-normal",
        className,
      )}
      {...props}
    />
  );
}

function ResponsiveOptionsFooter({
  ...props
}: React.ComponentProps<typeof DrawerFooter>) {
  return <DrawerFooter data-slot="responsive-options-footer" {...props} />;
}

function ResponsiveOptionsClose({
  ...props
}: React.ComponentProps<typeof DrawerClose>) {
  return <DrawerClose data-slot="responsive-options-close" {...props} />;
}

export {
  ResponsiveOptions,
  ResponsiveOptionsClose,
  ResponsiveOptionsContent,
  ResponsiveOptionsDescription,
  ResponsiveOptionsDesktop,
  ResponsiveOptionsFooter,
  ResponsiveOptionsGroup,
  ResponsiveOptionsHeader,
  ResponsiveOptionsItem,
  ResponsiveOptionsTitle,
  ResponsiveOptionsTrigger,
};
