"use client";

import * as React from "react";
// import { Button } from "@tomatini/ui/components/button";
import {
  Editor,
  EditorContent,
  // EditorToolbar,
  type TiptapEditor,
  useTiptapEditor,
} from "@/components/ui/tiptap/editor";
// import { EditorToolBarHeadings } from "@tomatini/ui/components/tiptap/toolbar/headings";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
// import { EditorToolbarToggleButton } from "@tomatini/ui/components/tiptap/toolbar/toggle-button";
// import { EditorToolbarCompactFormatMenu } from "@tomatini/ui/components/tiptap/toolbar/compact-format-menu";
// import {
//   Bold,
//   Italic,
//   List,
//   ListOrdered,
//   Strikethrough,
//   TextQuote,
//   Underline,
// } from "lucide-react";
// import { Separator } from "@tomatini/ui/components/separator";
// import { EditorToolbarHistoryButtons } from "@tomatini/ui/components/tiptap/toolbar/history";
import { TipTapFloatingMenu } from "@/components/ui/tiptap/toolbar/floating-menu";
import {
  floatingPopoverTriggerUsesSlash,
  type FloatingPopoverTrigger,
} from "@/components/ui/tiptap/toolbar/floating-popover";
import { cn } from "@/lib/utils";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { useUnmount } from "@/hooks/use-unmount";
import { ActiveBlock } from "@/components/ui/tiptap/extensions/active-block";

export interface MarkdownEditorHandle {
  getMarkdown: () => string | undefined;
  flushPendingSync: () => string | undefined;
}

export interface MarkdownEditorToolbarStatus {
  label: string;
  tone: "ready" | "dirty" | "live";
}

export type { FloatingPopoverTrigger };

export interface MarkdownEditorProps {
  initialContent: string | undefined;
  onUpdate: (markdown: string) => void;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;
  scrollAreaClassName?: string;
  scrollMode?: "contained" | "document";
  editorHandleRef?: React.Ref<MarkdownEditorHandle | null>;
  toolbarStatus?: MarkdownEditorToolbarStatus;
  onSave?: () => void | Promise<void>;
  onReset?: () => void | Promise<void>;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
  isSavePending?: boolean;
  floatingPopoverTrigger?: FloatingPopoverTrigger;
}

function isEffectivelyEmptyMarkdown(markdown: string | undefined) {
  if (!markdown) return true;
  return markdown.trim().length === 0;
}

function normalizeMarkdown(markdown: string | undefined): string {
  return isEffectivelyEmptyMarkdown(markdown) ? "" : (markdown ?? "");
}

export function MarkdownEditor({
  initialContent,
  onUpdate,
  readOnly = false,
  className,
  editorClassName,
  scrollAreaClassName,
  scrollMode = "contained",
  editorHandleRef,
  // toolbarStatus,
  // onSave,
  // onReset,
  // saveDisabled,
  // resetDisabled,
  // isSavePending,
  floatingPopoverTrigger = "slash",
}: MarkdownEditorProps) {
  const editorRef = React.useRef<TiptapEditor | null>(null);
  const lastEmittedRef = React.useRef<string | null>(null);
  const onUpdateRef = React.useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const readMarkdown = React.useCallback(() => {
    if (editorRef.current && !editorRef.current.isDestroyed) {
      return normalizeMarkdown(editorRef.current.getMarkdown());
    }
    return "";
  }, []);

  const syncToForm = React.useCallback(() => {
    const markdown = readMarkdown();
    if (!markdown) return;
    if (lastEmittedRef.current === markdown) return;
    lastEmittedRef.current = markdown;
    onUpdateRef.current(markdown);
  }, [readMarkdown]);

  const debouncedSyncRef = React.useRef<{ flush: () => void }>({
    flush: () => {},
  });
  useUnmount(() => {
    debouncedSyncRef.current.flush();
  });

  const debouncedSync = useDebounceCallback(syncToForm, 250);
  debouncedSyncRef.current = debouncedSync;

  React.useImperativeHandle(
    editorHandleRef,
    () => ({
      getMarkdown: readMarkdown,
      flushPendingSync: () => {
        debouncedSync.flush();
        return readMarkdown();
      },
    }),
    [debouncedSync, readMarkdown],
  );

  const stableContentRef = React.useRef(normalizeMarkdown(initialContent));
  const includeSlashPlaceholder = React.useMemo(
    () => floatingPopoverTriggerUsesSlash(floatingPopoverTrigger),
    [floatingPopoverTrigger],
  );

  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc",
          },
        },
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown,
      Typography,
      ActiveBlock,
      Placeholder.configure({
        emptyNodeClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none",
        placeholder: ({ node }) => {
          switch (node.type.name) {
            case "heading":
              return `Heading ${node.attrs.level}`;
            case "detailsSummary":
              return "Section title";
            case "codeBlock":
              return "";
            default:
              return includeSlashPlaceholder
                ? "Write, type '/' for commands"
                : "Write something";
          }
        },
        includeChildren: false,
      }),
    ],
    [includeSlashPlaceholder],
  );

  const handlePaste = React.useCallback(
    (_view: unknown, event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData || !editorRef.current) return false;

      const text = clipboardData.getData("text/plain");

      if (text?.trim().length) {
        const hasMarkdownSyntax =
          /^[\s]*[-*+]\s/m.test(text) ||
          /^[\s]*\d+\.\s/m.test(text) ||
          /^#+\s/m.test(text);

        if (hasMarkdownSyntax) {
          event.preventDefault();
          const { selection } = editorRef.current.state;
          editorRef.current.commands.insertContentAt(
            { from: selection.from, to: selection.to },
            text,
            { contentType: "markdown" },
          );
          return true;
        }
      }

      return false;
    },
    [],
  );

  const editorProps = React.useMemo(
    () => ({
      attributes: {
        class: "max-w-full focus:outline-none",
      },
      handlePaste,
    }),
    [handlePaste],
  );

  const editor = useTiptapEditor({
    extensions,
    editorProps,
    content: stableContentRef.current,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
    onUpdate: () => {
      debouncedSync();
    },
    contentType: "markdown",
    editable: !readOnly,
  });

  React.useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  React.useEffect(() => {
    if (!editor) return;
    const nextContent = normalizeMarkdown(initialContent);
    if (readMarkdown() === nextContent) return;
    lastEmittedRef.current = nextContent;
    editor.commands.setContent(nextContent, {
      contentType: "markdown",
      emitUpdate: false,
    });
  }, [editor, initialContent, readMarkdown]);

  React.useEffect(() => {
    if (!editor) return;

    const flush = () => debouncedSync.flush();
    editor.on("blur", flush);

    return () => {
      editor.off("blur", flush);
    };
  }, [editor, debouncedSync]);

  // const statusDotClassName = React.useMemo(() => {
  //   if (!toolbarStatus) return "bg-emerald-600/80";

  //   switch (toolbarStatus.tone) {
  //     case "live":
  //       return "bg-sky-600/80";
  //     case "dirty":
  //       return "bg-amber-600/80";
  //     case "ready":
  //       return "bg-emerald-600/80";
  //     default:
  //       return "bg-emerald-600/80";
  //   }
  // }, [toolbarStatus]);

  // const showToolbarMeta = Boolean(toolbarStatus || onReset || onSave);

  if (!editor) return null;
  return (
    <Editor
      editor={editor}
      className={cn("flex h-full min-h-0 flex-1 flex-col", editorClassName)}
    >
      {!readOnly ? (
        <TipTapFloatingMenu editor={editor} trigger={floatingPopoverTrigger} />
      ) : null}
      {/* <EditorToolbar className="overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <div className="shrink-0">
            <EditorToolbarHistoryButtons tooltip={["Undo", "Redo"]} />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Separator orientation="vertical" className="shrink-0" />
            <div className="shrink-0">
              <EditorToolbarCompactFormatMenu
                includeHeadings
                includeStyles
                includeLists
              />
            </div>
          </div>
          <div className="min-w-0 items-center gap-2 flex">
            <Separator orientation="vertical" className="shrink-0" />
            <div className="shrink-0">
              <EditorToolBarHeadings />
            </div>
            <Separator orientation="vertical" className="shrink-0" />
            <div className="shrink-0">
              <div>
                <EditorToolbarToggleButton
                  attribute="bold"
                  icon={Bold}
                  tooltip="Bold"
                />
                <EditorToolbarToggleButton
                  attribute="italic"
                  icon={Italic}
                  tooltip="Italic"
                />
                <EditorToolbarToggleButton
                  attribute="underline"
                  icon={Underline}
                  tooltip="Underline"
                />
                <EditorToolbarToggleButton
                  attribute="strike"
                  icon={Strikethrough}
                  tooltip="Strikethrough"
                />
              </div>
            </div>
            <Separator orientation="vertical" className="shrink-0" />
            <div className="shrink-0">
              <div>
                <EditorToolbarToggleButton
                  attribute="bulletList"
                  icon={List}
                  tooltip="Bullet list"
                />
                <EditorToolbarToggleButton
                  attribute="orderedList"
                  icon={ListOrdered}
                  tooltip="Ordered list"
                />
                <EditorToolbarToggleButton
                  attribute="blockquote"
                  icon={TextQuote}
                  tooltip="Blockquote"
                />
              </div>
            </div>
          </div>
        </div>
        {showToolbarMeta ? (
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
            {toolbarStatus ? (
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", statusDotClassName)}
                />
                <span className="truncate text-[11px] text-muted-foreground font-normal">
                  {toolbarStatus.label}
                </span>
              </div>
            ) : null}
            {onReset ? (
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(resetDisabled)}
                onClick={() => {
                  void onReset();
                }}
              >
                Reset
              </Button>
            ) : null}
            {onSave ? (
              <Button
                type="button"
                disabled={Boolean(saveDisabled)}
                onClick={() => {
                  void onSave();
                }}
              >
                {isSavePending ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="ml-auto min-w-0" />
        )}
      </EditorToolbar> */}

      {/* 48 * 2 for margins
      24 * 2 for card padding y
      42 for card header
      24 * 2 for gap between header and editor and footer
      and 52 for the header + 1px for border bottom
      36 for card footer
      another 48 for bottom margin
      4 px bufffer
      = 323px */}
      <EditorContent
        className={cn("min-h-0", className)}
        scrollAreaClassName={scrollAreaClassName}
        scrollMode={scrollMode}
      />
    </Editor>
  );
}
