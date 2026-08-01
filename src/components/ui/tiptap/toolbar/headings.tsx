"use client";

import React from "react";
import {
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEditor } from "@/components/ui/tiptap/editor";
import { useEditorForceUpdate } from "@/hooks/use-editor-force-update";

const levels = [1, 2, 3, 4] as const;

export function EditorToolBarHeadings({
  className,
  compact = false,
  ...props
}: React.ComponentProps<typeof Button> & { compact?: boolean }) {
  const { editor } = useEditor();
  useEditorForceUpdate(editor);
  const selectionRef = React.useRef<{ from: number; to: number } | null>(null);
  const commandSelectionRef = React.useRef<{ from: number; to: number } | null>(
    null,
  );

  const readCurrentSelection = React.useCallback(() => {
    if (!editor) return null;
    const { from, to, empty } = editor.state.selection;
    return empty ? null : { from, to };
  }, [editor]);

  const captureCommandSelection = React.useCallback(() => {
    commandSelectionRef.current = readCurrentSelection();
  }, [readCurrentSelection]);

  const runHeadingCommand = React.useCallback(
    (level: (typeof levels)[number] | "paragraph") => {
      if (!editor) return;

      const selection = commandSelectionRef.current ?? selectionRef.current;

      const chain = editor.chain().focus(undefined, { scrollIntoView: false });

      if (selection) {
        chain.setTextSelection(selection);
      }

      if (level === "paragraph") {
        chain.setParagraph().run();
        return;
      }

      chain.setHeading({ level }).run();
    },
    [editor],
  );

  React.useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      selectionRef.current = readCurrentSelection();
    };

    updateSelection();
    editor.on("selectionUpdate", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor, readCurrentSelection]);

  const TriggerIcon = React.useMemo(() => {
    if (!editor?.isActive("heading")) return Pilcrow;
    if (editor.isActive("heading", { level: 1 })) return Heading1;
    if (editor.isActive("heading", { level: 2 })) return Heading2;
    if (editor.isActive("heading", { level: 3 })) return Heading3;
    if (editor.isActive("heading", { level: 4 })) return Heading4;
    return Pilcrow;
  }, [editor]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <DropdownMenu
            modal={false}
            onOpenChange={(open) => {
              if (!open) {
                commandSelectionRef.current = null;
                return;
              }

              if (!commandSelectionRef.current) {
                commandSelectionRef.current = readCurrentSelection();
              }
            }}
          />
        }
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size={compact ? "icon" : "sm"}
              className={cn(
                compact
                  ? "h-8 w-8 p-0 sm:h-9 sm:w-9"
                  : "h-8 gap-1 px-2 font-normal justify-start border-none",
                className,
              )}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onPointerDownCapture={() => {
                captureCommandSelection();
              }}
              aria-label="Headings"
              {...props}
            />
          }
        >
          <TriggerIcon className="h-4 w-4" />
          {!compact ? (
            <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 min-w-52">
          <DropdownMenuItem
            onClick={() => {
              runHeadingCommand("paragraph");
            }}
            className={cn(
              "flex h-fit w-full items-center gap-2 whitespace-nowrap",
            )}
          >
            <Pilcrow className="h-4 w-4" />
            Paragraph
            {!editor?.isActive("heading") ? (
              <Check className="h-4 w-4 ml-auto text-muted-foreground" />
            ) : null}
          </DropdownMenuItem>
          {levels.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => {
                runHeadingCommand(level);
              }}
              className="w-full whitespace-nowrap"
            >
              {level === 1 && <Heading1 className="h-4 w-4" />}
              {level === 2 && <Heading2 className="h-4 w-4" />}
              {level === 3 && <Heading3 className="h-4 w-4" />}
              {level === 4 && <Heading4 className="h-4 w-4" />}
              Heading {level}
              {editor?.isActive("heading", { level }) ? (
                <Check className="h-4 w-4 ml-auto text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </TooltipTrigger>
      <TooltipContent>
        <span>Headings</span>
      </TooltipContent>
    </Tooltip>
  );
}
