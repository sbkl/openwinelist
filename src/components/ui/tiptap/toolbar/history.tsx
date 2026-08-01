"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type LucideIcon, Redo2, Undo2 } from "lucide-react";
import { useEditor } from "@/components/ui/tiptap/editor";
import { useEditorForceUpdate } from "@/hooks/use-editor-force-update";
import { useEditorState } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface EditorToolbarHistoryButtonsProps extends Omit<
  React.ComponentProps<typeof Button>,
  "tooltip" | "onClick"
> {
  tooltip?: [undo: string, redo: string];
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function EditorToolbarHistoryButtons({
  tooltip,
  ...props
}: EditorToolbarHistoryButtonsProps) {
  const { editor } = useEditor();
  const [undoTooltip, redoTooltip] = tooltip ?? [];
  const { canUndo, canRedo } = useEditorState({
    editor,
    selector: ({ editor }) => {
      return {
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });
  if (!undoTooltip || !redoTooltip) {
    return (
      <div>
        <InnerButton
          {...props}
          icon={Undo2}
          attribute="undo"
          disabled={!canUndo}
        />
        <InnerButton
          {...props}
          icon={Redo2}
          attribute="redo"
          disabled={!canRedo}
        />
      </div>
    );
  }
  return (
    <div>
      <Tooltip>
        <TooltipTrigger
          render={
            <InnerButton
              {...props}
              icon={Undo2}
              attribute="undo"
              disabled={!canUndo}
            />
          }
        />
        <TooltipContent>
          <span>{undoTooltip}</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <InnerButton
              {...props}
              icon={Redo2}
              attribute="redo"
              disabled={!canRedo}
            />
          }
        />
        <TooltipContent>
          <span>{redoTooltip}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface InnerButtonProps extends Omit<
  EditorToolbarHistoryButtonsProps,
  "tooltip"
> {
  icon: LucideIcon;
  attribute: "undo" | "redo";
}

function runHistoryCommand(
  editor: ReturnType<typeof useEditor>["editor"],
  attribute: InnerButtonProps["attribute"],
) {
  const chain = editor.chain().focus(undefined, { scrollIntoView: false });

  switch (attribute) {
    case "undo":
      chain.undo().run();
      break;
    case "redo":
      chain.redo().run();
      break;
    default:
      break;
  }
}

function InnerButton({
  className,
  onClick,
  children,
  icon: Icon,
  attribute,
  ...props
}: InnerButtonProps) {
  const { editor } = useEditor();
  const isActive = editor?.isActive(attribute) ?? false;

  // Force re-render when editor selection changes
  const forceUpdateKey = useEditorForceUpdate(editor);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!editor || !forceUpdateKey) return;
      runHistoryCommand(editor, attribute);

      onClick?.(e);
    },
    [attribute, editor, onClick, forceUpdateKey],
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (event.button !== 0 || !editor || !forceUpdateKey) {
        return;
      }

      runHistoryCommand(editor, attribute);
    },
    [attribute, editor, forceUpdateKey],
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 p-0 sm:h-9 sm:w-9",
        isActive && "bg-accent/50",
        className,
      )}
      onMouseDown={handleMouseDown}
      onClick={(event) => {
        if (event.detail !== 0) {
          return;
        }

        handleClick(event);
      }}
      {...props}
    >
      {children ?? <Icon className="h-4 w-4" />}
    </Button>
  );
}
