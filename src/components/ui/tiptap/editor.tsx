"use client";

import * as React from "react";
export { useEditor as useTiptapEditor } from "@tiptap/react";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
export type { EditorContent as TiptapEditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/react";

export type { Editor as TiptapEditor } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";

interface EditorProps extends React.ComponentProps<"div"> {
  editor: TiptapEditor | null;
}

interface EditorContextProps {
  editor: TiptapEditor;
}

const EditorContext = React.createContext<EditorContextProps | undefined>(
  undefined,
);

export function Editor({ className, editor, children, ...props }: EditorProps) {
  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-card",
        className,
      )}
      {...props}
    >
      <EditorContext value={{ editor }}>{children}</EditorContext>
    </div>
  );
}

export function useEditor() {
  const context = React.use(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
}

interface EditorContentProps {
  className?: string;
  scrollAreaClassName?: string;
  scrollMode?: "contained" | "document";
}

export function EditorContent({
  className,
  scrollAreaClassName,
  scrollMode = "contained",
}: EditorContentProps) {
  const { editor } = useEditor();
  if (scrollMode === "document") {
    return (
      <div className={cn("min-h-0 w-full", scrollAreaClassName)}>
        <TiptapEditorContent
          editor={editor}
          className={cn(
            "prose w-full max-w-none cursor-text [&_.tiptap]:min-h-full [&_.tiptap]:px-6 [&_.tiptap]:py-4 [&_.tiptap]:focus:outline-none",
            className,
          )}
        />
      </div>
    );
  }

  return (
    <ScrollArea
      className={cn(
        "flex-1 min-h-0 w-full overflow-hidden bg-background/50",
        scrollAreaClassName,
      )}
      viewportClassName={cn("size-full", className)}
    >
      <TiptapEditorContent
        editor={editor}
        className="prose h-full w-full max-w-none cursor-text [&_.tiptap]:min-h-full [&_.tiptap]:px-6 [&_.tiptap]:py-4 [&_.tiptap]:focus:outline-none"
      />
    </ScrollArea>
  );
}

export function EditorToolbar({
  ref,
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <TooltipProvider>
      <div
        ref={ref}
        className={cn(
          "sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b border-border/50 bg-background px-3 text-2xl font-bold",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TooltipProvider>
  );
}
