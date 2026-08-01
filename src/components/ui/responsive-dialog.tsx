"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ResponsiveDialogMode = "dialog" | "drawer";

const ResponsiveDialogContext =
  React.createContext<ResponsiveDialogMode | null>(null);

function useResponsiveDialogMode() {
  const mode = React.use(ResponsiveDialogContext);

  if (!mode) {
    throw new Error(
      "Responsive dialog components must be used within ResponsiveDialog.",
    );
  }

  return mode;
}

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  modal?: React.ComponentProps<typeof Dialog>["modal"];
  disablePointerDismissal?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
}

function ResponsiveDialog({
  children,
  open,
  defaultOpen,
  modal,
  disablePointerDismissal,
  onOpenChange,
  onOpenChangeComplete,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveDialogContext value="drawer">
        <Drawer
          defaultOpen={defaultOpen}
          disablePointerDismissal={disablePointerDismissal}
          modal={modal}
          onOpenChange={onOpenChange}
          onOpenChangeComplete={onOpenChangeComplete}
          open={open}
          showSwipeHandle
        >
          {children}
        </Drawer>
      </ResponsiveDialogContext>
    );
  }

  return (
    <ResponsiveDialogContext value="dialog">
      <Dialog
        defaultOpen={defaultOpen}
        disablePointerDismissal={disablePointerDismissal}
        modal={modal}
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
        open={open}
      >
        {children}
      </Dialog>
    </ResponsiveDialogContext>
  );
}

function ResponsiveDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerTrigger {...props} />
  ) : (
    <DialogTrigger {...props} />
  );
}

type ResponsiveDialogContentProps = React.ComponentProps<"div"> &
  Pick<
    React.ComponentProps<typeof DialogContent>,
    "finalFocus" | "initialFocus"
  > & {
    showCloseButton?: boolean;
  };

function ResponsiveDialogContent({
  showCloseButton,
  ...props
}: ResponsiveDialogContentProps) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerContent {...props} />
  ) : (
    <DialogContent showCloseButton={showCloseButton} {...props} />
  );
}

function ResponsiveDialogHeader({
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerHeader {...props} />
  ) : (
    <DialogHeader {...props} />
  );
}

function ResponsiveDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const mode = useResponsiveDialogMode();

  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn(
        mode === "drawer" &&
          "min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-track]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function ResponsiveDialogFooter({
  className,
  showCloseButton,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <>
      <Separator />
      <DrawerFooter
        className={cn("flex-col-reverse pt-4", className)}
        {...props}
      />
    </>
  ) : (
    <DialogFooter
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    />
  );
}

function ResponsiveDialogTitle({
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  );
}

function ResponsiveDialogDescription({
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  );
}

function ResponsiveDialogClose({
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const mode = useResponsiveDialogMode();

  return mode === "drawer" ? (
    <DrawerClose render={<Button variant="outline" {...props} />} />
  ) : (
    <DialogClose {...props} />
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
