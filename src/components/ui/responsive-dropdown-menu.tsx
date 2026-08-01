"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ResponsiveDropdownMenuMode = "dropdown" | "drawer";

const ResponsiveDropdownMenuContext =
  React.createContext<ResponsiveDropdownMenuMode | null>(null);

function useResponsiveDropdownMenuMode() {
  const mode = React.use(ResponsiveDropdownMenuContext);

  if (!mode) {
    throw new Error(
      "Responsive dropdown menu components must be used within ResponsiveDropdownMenu.",
    );
  }

  return mode;
}

interface ResponsiveDropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  showSwipeHandle?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ResponsiveDropdownMenu({
  children,
  open,
  defaultOpen,
  modal,
  showSwipeHandle = true,
  onOpenChange,
}: ResponsiveDropdownMenuProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveDropdownMenuContext value="drawer">
        <Drawer
          defaultOpen={defaultOpen}
          modal={modal}
          onOpenChange={onOpenChange}
          open={open}
          showSwipeHandle={showSwipeHandle}
        >
          {children}
        </Drawer>
      </ResponsiveDropdownMenuContext>
    );
  }

  return (
    <ResponsiveDropdownMenuContext value="dropdown">
      <DropdownMenu
        defaultOpen={defaultOpen}
        modal={modal}
        onOpenChange={onOpenChange}
        open={open}
      >
        {children}
      </DropdownMenu>
    </ResponsiveDropdownMenuContext>
  );
}

type ResponsiveDropdownMenuTriggerProps = Pick<
  React.ComponentProps<typeof DropdownMenuTrigger>,
  "children" | "className" | "disabled" | "render"
>;

function ResponsiveDropdownMenuTrigger(
  props: ResponsiveDropdownMenuTriggerProps,
) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <DrawerTrigger data-slot="responsive-dropdown-menu-trigger" {...props} />
  ) : (
    <DropdownMenuTrigger
      data-slot="responsive-dropdown-menu-trigger"
      {...props}
    />
  );
}

type ResponsiveDropdownMenuContentProps = React.ComponentProps<"div"> &
  Pick<
    React.ComponentProps<typeof DropdownMenuContent>,
    "align" | "alignOffset" | "side" | "sideOffset"
  > &
  Pick<React.ComponentProps<typeof DrawerContent>, "initialFocus">;

function ResponsiveDropdownMenuContent({
  align,
  alignOffset,
  side,
  sideOffset,
  ...props
}: ResponsiveDropdownMenuContentProps) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <DrawerContent data-slot="responsive-dropdown-menu-content" {...props} />
  ) : (
    <DropdownMenuContent
      data-slot="responsive-dropdown-menu-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function ResponsiveDropdownMenuHeader({
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <DrawerHeader data-slot="responsive-dropdown-menu-header" {...props} />
  ) : (
    <DropdownMenuGroup data-slot="responsive-dropdown-menu-header" {...props} />
  );
}

function ResponsiveDropdownMenuTitle({
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <DrawerTitle data-slot="responsive-dropdown-menu-title" {...props} />
  ) : (
    <DropdownMenuLabel data-slot="responsive-dropdown-menu-title" {...props} />
  );
}

function ResponsiveDropdownMenuDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <DrawerDescription
      data-slot="responsive-dropdown-menu-description"
      className={className}
      {...props}
    />
  ) : (
    <p
      data-slot="responsive-dropdown-menu-description"
      className={cn("px-1.5 pb-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function ResponsiveDropdownMenuGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <div
      data-slot="responsive-dropdown-menu-group"
      className={cn("flex flex-col gap-1 p-4", className)}
      {...props}
    />
  ) : (
    <DropdownMenuGroup
      data-slot="responsive-dropdown-menu-group"
      className={className}
      {...props}
    />
  );
}

interface ResponsiveDropdownMenuItemProps {
  "aria-label"?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  inset?: boolean;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

function ResponsiveDropdownMenuItem({
  "aria-label": ariaLabel,
  children,
  className,
  disabled,
  inset,
  onClick,
  variant = "default",
}: ResponsiveDropdownMenuItemProps) {
  const mode = useResponsiveDropdownMenuMode();

  if (mode === "drawer") {
    return (
      <DrawerClose
        data-slot="responsive-dropdown-menu-item"
        render={
          <Button
            className={cn(
              "h-auto min-h-11 w-full justify-start px-3 py-3 text-left whitespace-normal",
              className,
            )}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            type="button"
            variant={variant === "destructive" ? "destructive" : "ghost"}
          />
        }
      >
        {children}
      </DrawerClose>
    );
  }

  return (
    <DropdownMenuItem
      data-slot="responsive-dropdown-menu-item"
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      inset={inset}
      onClick={onClick}
      variant={variant}
    >
      {children}
    </DropdownMenuItem>
  );
}

function ResponsiveDropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveDropdownMenuMode();

  return mode === "drawer" ? (
    <Separator
      data-slot="responsive-dropdown-menu-separator"
      className={cn("mx-4 w-auto", className)}
      {...props}
    />
  ) : (
    <DropdownMenuSeparator
      data-slot="responsive-dropdown-menu-separator"
      className={className}
      {...props}
    />
  );
}

export {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuDescription,
  ResponsiveDropdownMenuGroup,
  ResponsiveDropdownMenuHeader,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTitle,
  ResponsiveDropdownMenuTrigger,
};
