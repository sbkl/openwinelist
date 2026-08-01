"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/components/ui/tiptap/editor";
import { useEditorForceUpdate } from "@/hooks/use-editor-force-update";
import { cn } from "@/lib/utils";
import {
  Bold,
  Check,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  MoreVertical,
  Pilcrow,
  Strikethrough,
  TextQuote,
  Underline,
} from "lucide-react";
import {
  canToggleCommand,
  isToggleActive,
  runToggleCommand,
  type EditorToolbarToggleAttribute,
} from "./toggle-utils";

interface CompactFormatMenuProps {
  includeHeadings?: boolean;
  includeStyles?: boolean;
  includeLists?: boolean;
  className?: string;
}

interface SelectionRange {
  from: number;
  to: number;
}

const headingLevels = [1, 2, 3, 4] as const;

export function EditorToolbarCompactFormatMenu({
  includeHeadings = false,
  includeStyles = false,
  includeLists = false,
  className,
}: CompactFormatMenuProps) {
  const { editor } = useEditor();
  useEditorForceUpdate(editor);
  const selectionRef = React.useRef<SelectionRange | null>(null);
  const commandSelectionRef = React.useRef<SelectionRange | null>(null);

  const readCurrentSelection = React.useCallback((): SelectionRange | null => {
    if (!editor) return null;
    const { from, to, empty } = editor.state.selection;
    return empty ? null : { from, to };
  }, [editor]);

  const captureCommandSelection = React.useCallback(() => {
    commandSelectionRef.current = readCurrentSelection();
  }, [readCurrentSelection]);

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

  const runHeadingCommand = React.useCallback(
    (level: (typeof headingLevels)[number] | "paragraph") => {
      if (!editor) return;

      const chain = editor.chain().focus(undefined, { scrollIntoView: false });

      const commandSelection =
        commandSelectionRef.current ?? selectionRef.current;

      if (commandSelection) {
        chain.setTextSelection(commandSelection);
      }

      if (level === "paragraph") {
        chain.setParagraph().run();
        return;
      }

      chain.setHeading({ level }).run();
    },
    [editor],
  );

  const runMarkCommand = React.useCallback(
    (attribute: EditorToolbarToggleAttribute) => {
      if (!editor) return;
      runToggleCommand(
        editor,
        attribute,
        commandSelectionRef.current ?? selectionRef.current,
      );
    },
    [editor],
  );

  const handleMenuOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        commandSelectionRef.current = null;
        return;
      }

      if (!commandSelectionRef.current) {
        commandSelectionRef.current = readCurrentSelection();
      }
    },
    [readCurrentSelection],
  );

  const styleItems: Array<{
    attribute: EditorToolbarToggleAttribute;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = [
    { attribute: "bold", icon: Bold, label: "Bold" },
    { attribute: "italic", icon: Italic, label: "Italic" },
    { attribute: "underline", icon: Underline, label: "Underline" },
    { attribute: "strike", icon: Strikethrough, label: "Strikethrough" },
  ];

  const listItems: Array<{
    attribute: EditorToolbarToggleAttribute;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = [
    { attribute: "bulletList", icon: List, label: "Bullet list" },
    { attribute: "orderedList", icon: ListOrdered, label: "Ordered list" },
    { attribute: "blockquote", icon: TextQuote, label: "Blockquote" },
  ];

  return (
    <DropdownMenu modal={false} onOpenChange={handleMenuOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)}
                  aria-label="Formatting options"
                  onPointerDownCapture={() => {
                    captureCommandSelection();
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>
          <span>Formatting options</span>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-64 min-w-64">
        {includeHeadings ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Typography</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => {
                runHeadingCommand("paragraph");
              }}
            >
              <Pilcrow className="h-4 w-4" />
              Paragraph
              {!editor?.isActive("heading") ? (
                <Check className="h-4 w-4 ml-auto text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
            {headingLevels.map((level) => {
              const Icon =
                level === 1
                  ? Heading1
                  : level === 2
                    ? Heading2
                    : level === 3
                      ? Heading3
                      : Heading4;
              return (
                <DropdownMenuItem
                  key={`heading-${level}`}
                  onSelect={() => {
                    runHeadingCommand(level);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  Heading {level}
                  {editor?.isActive("heading", { level }) ? (
                    <Check className="h-4 w-4 ml-auto text-muted-foreground" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ) : null}

        {includeStyles ? (
          <>
            {includeHeadings ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Text styles</DropdownMenuLabel>
              {styleItems.map(({ attribute, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={attribute}
                  disabled={!editor || !canToggleCommand(editor, attribute)}
                  onSelect={() => {
                    runMarkCommand(attribute);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {editor && isToggleActive(editor, attribute) ? (
                    <Check className="h-4 w-4 ml-auto text-muted-foreground" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}

        {includeLists ? (
          <>
            {includeHeadings || includeStyles ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Lists and quote</DropdownMenuLabel>
              {listItems.map(({ attribute, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={attribute}
                  disabled={!editor || !canToggleCommand(editor, attribute)}
                  onSelect={() => {
                    runMarkCommand(attribute);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {editor && isToggleActive(editor, attribute) ? (
                    <Check className="h-4 w-4 ml-auto text-muted-foreground" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
