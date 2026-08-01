"use client";

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useEditor } from "../editor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEditorForceUpdate } from "@/hooks/use-editor-force-update";
import {
  canToggleCommand,
  isToggleActive,
  isToggleBlockedByContext,
  runToggleCommand,
  type EditorToolbarToggleAttribute,
} from "./toggle-utils";

interface EditorToolBarToggleButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon: LucideIcon;
  tooltip?: string;
  attribute: EditorToolbarToggleAttribute;
}

export function EditorToolbarToggleButton({
  tooltip,
  ...props
}: EditorToolBarToggleButtonProps) {
  if (!tooltip) {
    return <InnerButton {...props} />;
  }
  return (
    <Tooltip>
      <TooltipTrigger render={<InnerButton {...props} />} />
      <TooltipContent>
        <span>{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  );
}

function InnerButton({
  className,
  onClick,
  children,
  icon: Icon,
  attribute,
  ...props
}: Omit<EditorToolBarToggleButtonProps, "tooltip">) {
  const { editor } = useEditor();
  const isBoldBlockedByHeading = editor
    ? isToggleBlockedByContext(editor, attribute)
    : false;
  const isActive = editor ? isToggleActive(editor, attribute) : false;

  const forceUpdateKey = useEditorForceUpdate(editor);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!editor || isBoldBlockedByHeading) return;
      runToggleCommand(editor, attribute);

      onClick?.(e);
    },
    [attribute, editor, isBoldBlockedByHeading, onClick],
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (event.button !== 0 || !editor || isBoldBlockedByHeading) {
        return;
      }

      runToggleCommand(editor, attribute);
    },
    [attribute, editor, isBoldBlockedByHeading],
  );

  const disabled = React.useMemo(() => {
    if (!editor || !forceUpdateKey) return true;
    return !canToggleCommand(editor, attribute);
  }, [attribute, editor, forceUpdateKey]);
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
      disabled={disabled}
      {...props}
    >
      {children ?? <Icon className="h-4 w-4" />}
    </Button>
  );
}
