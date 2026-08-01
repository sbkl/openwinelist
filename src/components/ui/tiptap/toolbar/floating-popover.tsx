"use client";

import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Editor } from "@tiptap/core";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

export interface CommandItemType {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
  command: (editor: Editor) => void;
  group: string;
  kbd: string | null;
}

export type CommandGroupType = {
  group: string;
  items: Omit<CommandItemType, "group">[];
};

export interface FloatingPopoverAnchorRect {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export type FloatingPopoverTriggerCleanup = (
  editor: Editor,
  search: string,
) => void;

export interface FloatingPopoverTriggerMatch {
  query: string;
  anchorRect: FloatingPopoverAnchorRect;
  inputAnchorRect?: FloatingPopoverAnchorRect;
  inputPrefix?: string;
  isAtBlockStart?: boolean;
  beforeCommand?: FloatingPopoverTriggerCleanup;
  onBackspaceEmpty?: FloatingPopoverTriggerCleanup;
  onClose?: FloatingPopoverTriggerCleanup;
  reopenKey?: string;
  reopenKeyPrefix?: string;
}

export type FloatingPopoverTriggerMatcher = (
  editor: Editor,
) => FloatingPopoverTriggerMatch | null;

export type FloatingPopoverTriggerPreset = "selection" | "slash";

export type FloatingPopoverTrigger =
  | FloatingPopoverTriggerPreset
  | FloatingPopoverTriggerMatcher
  | {
      match: FloatingPopoverTriggerMatcher;
      type?: "custom";
    };

function getSlashQuery(state: Editor["state"]) {
  const { $from } = state.selection;
  const line = $from.parent.textBetween(0, $from.parentOffset, "\n", " ");
  const slashIndex = line.lastIndexOf("/");
  const isAtBlockStart = slashIndex === 0;
  const hasRequiredSpacing = isAtBlockStart || line[slashIndex - 1] === " ";
  const isSlash =
    slashIndex >= 0 &&
    hasRequiredSpacing &&
    $from.parent.type.name !== "codeBlock" &&
    $from.parentOffset === line.length;

  if (!isSlash) {
    return null;
  }

  const from = state.selection.from;
  const to = from;
  const query = line.slice(slashIndex + 1);
  const rangeStartOffset = isAtBlockStart ? slashIndex : slashIndex - 1;
  const triggerText = isAtBlockStart ? "/" : " /";
  const reopenKeyPrefix = `${Math.max(0, from - (line.length - rangeStartOffset))}:${triggerText}`;

  return {
    query,
    triggerText,
    reopenKeyPrefix,
    isAtBlockStart,
    range: {
      from: Math.max(0, from - (line.length - rangeStartOffset)),
      to,
    },
  };
}

function doesSuppressedSlashTriggerStillExist(
  editor: Editor,
  reopenKeyPrefix: string,
) {
  const separatorIndex = reopenKeyPrefix.indexOf(":");

  if (separatorIndex <= 0) {
    return false;
  }

  const from = Number.parseInt(reopenKeyPrefix.slice(0, separatorIndex), 10);
  const triggerText = reopenKeyPrefix.slice(separatorIndex + 1);

  if (Number.isNaN(from) || triggerText.length === 0) {
    return false;
  }

  return (
    editor.state.doc.textBetween(
      from,
      Math.min(editor.state.doc.content.size, from + triggerText.length),
      "\n",
      " ",
    ) === triggerText
  );
}

function getCursorAnchorRect(
  editor: Editor,
  position: number,
): FloatingPopoverAnchorRect {
  const { bottom, left, right, top } = editor.view.coordsAtPos(position);

  return { bottom, left, right, top };
}

function getSelectionAnchorRect(
  editor: Editor,
): FloatingPopoverAnchorRect | null {
  const { selection } = editor.state;
  const selectedText = editor.state.doc.textBetween(
    selection.from,
    selection.to,
    "\n",
    " ",
  );

  if (selection.empty || selectedText.length === 0) {
    return null;
  }

  const start = editor.view.coordsAtPos(selection.from);
  const end = editor.view.coordsAtPos(selection.to);

  return {
    bottom: Math.max(start.bottom, end.bottom),
    left: Math.min(start.left, end.left),
    right: Math.max(start.right, end.right),
    top: Math.min(start.top, end.top),
  };
}

function getSlashTriggerMatch(
  editor: Editor,
): FloatingPopoverTriggerMatch | null {
  const slashQuery = getSlashQuery(editor.state);

  if (!slashQuery) {
    return null;
  }

  return {
    query: slashQuery.query,
    anchorRect: getCursorAnchorRect(editor, editor.state.selection.from),
    inputAnchorRect: getCursorAnchorRect(
      editor,
      slashQuery.triggerText === " /"
        ? slashQuery.range.from + 1
        : slashQuery.range.from,
    ),
    inputPrefix: "/",
    isAtBlockStart: slashQuery.isAtBlockStart,
    reopenKey: `${slashQuery.reopenKeyPrefix}${slashQuery.query}`,
    reopenKeyPrefix: slashQuery.reopenKeyPrefix,
    beforeCommand: (instance) => {
      instance
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .deleteRange(slashQuery.range)
        .run();
    },
    onBackspaceEmpty: (instance) => {
      const from =
        slashQuery.triggerText === " /"
          ? slashQuery.range.from + 1
          : slashQuery.range.from;

      instance
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .deleteRange({ from, to: slashQuery.range.to })
        .run();
    },
    onClose: (instance, search) => {
      instance
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .insertContentAt(slashQuery.range, `${slashQuery.triggerText}${search}`)
        .run();
    },
  };
}

function getSelectionTriggerMatch(
  editor: Editor,
): FloatingPopoverTriggerMatch | null {
  const anchorRect = getSelectionAnchorRect(editor);

  if (!anchorRect) {
    return null;
  }

  return {
    query: "",
    anchorRect,
  };
}

function resolveTriggerMatcher(
  trigger: FloatingPopoverTrigger,
): FloatingPopoverTriggerMatcher {
  if (trigger === "slash") {
    return getSlashTriggerMatch;
  }

  if (trigger === "selection") {
    return getSelectionTriggerMatch;
  }

  if (typeof trigger === "function") {
    return trigger;
  }

  return trigger.match;
}

function normalizeAnchorRect(rect: FloatingPopoverAnchorRect) {
  const width = Math.max(0, rect.right - rect.left);
  const height = Math.max(0, rect.bottom - rect.top);

  return {
    bottom: rect.bottom,
    height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  };
}

export function floatingPopoverTriggerUsesSlash(
  trigger: FloatingPopoverTrigger | undefined,
) {
  if (!trigger) {
    return true;
  }

  return trigger === "slash";
}

export function FloatingPopover({
  editor,
  groups,
  trigger = "slash",
}: {
  editor: Editor;
  groups: CommandGroupType[];
  trigger?: FloatingPopoverTrigger;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeMatch, setActiveMatch] =
    useState<FloatingPopoverTriggerMatch | null>(null);
  const debounced = useDebounce(search, 120);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeMatchRef = useRef<FloatingPopoverTriggerMatch | null>(null);
  const searchRef = useRef(search);
  const suppressedReopenPrefixRef = useRef<string | null>(null);
  searchRef.current = search;

  const triggerMatcher = useMemo(
    () => resolveTriggerMatcher(trigger),
    [trigger],
  );

  const silentlyClose = useCallback(() => {
    activeMatchRef.current = null;
    setOpen(false);
    setActiveMatch(null);
    setSearch("");
  }, []);

  const updateFromEditor = useCallback(() => {
    if (
      suppressedReopenPrefixRef.current &&
      !doesSuppressedSlashTriggerStillExist(
        editor,
        suppressedReopenPrefixRef.current,
      )
    ) {
      suppressedReopenPrefixRef.current = null;
    }

    const nextMatch = triggerMatcher(editor);

    if (!nextMatch) {
      silentlyClose();
      return;
    }

    if (
      suppressedReopenPrefixRef.current &&
      nextMatch.reopenKeyPrefix === suppressedReopenPrefixRef.current
    ) {
      silentlyClose();
      return;
    }

    if (
      suppressedReopenPrefixRef.current &&
      nextMatch.reopenKeyPrefix !== suppressedReopenPrefixRef.current
    ) {
      suppressedReopenPrefixRef.current = null;
    }

    const shouldOpen = !activeMatchRef.current;
    const shouldSyncSearch =
      shouldOpen ||
      (editor.isFocused && activeMatchRef.current?.query !== nextMatch.query);

    activeMatchRef.current = nextMatch;
    setActiveMatch(nextMatch);
    setOpen(true);

    if (shouldSyncSearch) {
      setSearch(nextMatch.query);
    }

    if (shouldOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editor, silentlyClose, triggerMatcher]);

  useEffect(() => {
    editor.on("transaction", updateFromEditor);
    editor.on("selectionUpdate", updateFromEditor);
    window.addEventListener("resize", updateFromEditor);
    window.addEventListener("scroll", updateFromEditor, true);
    updateFromEditor();

    return () => {
      editor.off("transaction", updateFromEditor);
      editor.off("selectionUpdate", updateFromEditor);
      window.removeEventListener("resize", updateFromEditor);
      window.removeEventListener("scroll", updateFromEditor, true);
    };
  }, [editor, updateFromEditor]);

  const resetState = useCallback(() => {
    activeMatchRef.current = null;
    setOpen(false);
    setActiveMatch(null);
    setSearch("");
    requestAnimationFrame(() =>
      editor.chain().focus(undefined, { scrollIntoView: false }).run(),
    );
  }, [editor]);

  const closeAndClear = useCallback(() => {
    if (activeMatchRef.current?.reopenKeyPrefix) {
      suppressedReopenPrefixRef.current =
        activeMatchRef.current.reopenKeyPrefix;
    }
    activeMatchRef.current?.onClose?.(editor, searchRef.current);
    resetState();
  }, [editor, resetState]);

  const cancelTrigger = useCallback(() => {
    suppressedReopenPrefixRef.current = null;
    (
      activeMatchRef.current?.onBackspaceEmpty ??
      activeMatchRef.current?.beforeCommand
    )?.(editor, searchRef.current);
    resetState();
  }, [editor, resetState]);

  const executeCommand = useCallback(
    (fn: (editor: Editor) => void) => {
      suppressedReopenPrefixRef.current = null;
      activeMatchRef.current?.beforeCommand?.(editor, searchRef.current);
      fn(editor);
      resetState();
    },
    [editor, resetState],
  );

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.keywords.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [debounced, groups]);

  const activeBlockVisualState = useMemo(() => {
    if (!activeMatch?.inputPrefix || typeof window === "undefined") {
      return null;
    }

    const activeBlock = editor.view.dom.querySelector<HTMLElement>(
      "[data-active-block='true']",
    );

    if (!activeBlock) {
      return null;
    }

    // Tailwind typography `prose` values per block type
    // fontSize in px, lineHeight as multiplier, prefixInset/inputPaddingLeft in px
    const blockConfigs: Record<
      string,
      {
        fontSize: number;
        lineHeight: number;
        fontWeight: string;
        prefixInset: number;
        inputPaddingLeft: number;
      }
    > = {
      paragraph: {
        fontSize: 16,
        lineHeight: 1.75,
        fontWeight: "400",
        prefixInset: 2,
        inputPaddingLeft: 7,
      },
      heading1: {
        fontSize: 36,
        lineHeight: 1.1111,
        fontWeight: "800",
        prefixInset: 4,
        inputPaddingLeft: 16,
      },
      heading2: {
        fontSize: 24,
        lineHeight: 1.3333,
        fontWeight: "700",
        prefixInset: 3,
        inputPaddingLeft: 11,
      },
      heading3: {
        fontSize: 20,
        lineHeight: 1.6,
        fontWeight: "600",
        prefixInset: 3,
        inputPaddingLeft: 9,
      },
      heading4: {
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: "600",
        prefixInset: 2,
        inputPaddingLeft: 7,
      },
    };

    // Resolve block config from editor state
    const { $from } = editor.state.selection;
    const parentNode = $from.parent;
    let configKey = "paragraph";

    if (parentNode.type.name === "heading") {
      const level = parentNode.attrs.level as number;
      configKey = `heading${level}`;
    }

    const config = blockConfigs[configKey] ?? blockConfigs.paragraph;
    if (!config) {
      throw new Error(`Unknown block type: ${configKey}`);
    }
    const lineHeightPx = config.fontSize * config.lineHeight;

    const blockRect = activeBlock.getBoundingClientRect();
    const inputRect = activeMatch.inputAnchorRect ?? activeMatch.anchorRect;
    const computed = window.getComputedStyle(activeBlock);

    const textStyle = {
      color: computed.color,
      fontFamily: computed.fontFamily,
      fontSize: `${config.fontSize}px`,
      fontStyle: editor.isActive("italic") ? "italic" : computed.fontStyle,
      fontWeight: editor.isActive("bold") ? "700" : config.fontWeight,
      letterSpacing: computed.letterSpacing,
      lineHeight: `${lineHeightPx}px`,
    } satisfies React.CSSProperties;

    const minWidth = 220;

    if (activeMatch.isAtBlockStart) {
      return {
        anchorRect: {
          bottom: blockRect.top,
          left: blockRect.left - config.prefixInset,
          right: blockRect.right,
          top: blockRect.top,
        } satisfies FloatingPopoverAnchorRect,
        inputOffsetLeft: 0,
        prefixInset: config.prefixInset,
        inputPaddingLeft: config.inputPaddingLeft,
        width: Math.max(minWidth, blockRect.width + config.prefixInset),
        fontSize: config.fontSize,
        lineHeight: `${lineHeightPx}px`,
        textStyle,
      };
    }

    // Inline mode: position at cursor
    const editorRect = editor.view.dom.getBoundingClientRect();
    const availableWidth = editorRect.right - inputRect.left;

    if (availableWidth >= minWidth) {
      return {
        anchorRect: {
          bottom: inputRect.top,
          left: inputRect.left - config.prefixInset,
          right: inputRect.right,
          top: inputRect.top,
        } satisfies FloatingPopoverAnchorRect,
        inputOffsetLeft: 0,
        prefixInset: config.prefixInset,
        inputPaddingLeft: config.inputPaddingLeft,
        width: Math.max(minWidth, availableWidth + config.prefixInset),
        fontSize: config.fontSize,
        lineHeight: `${lineHeightPx}px`,
        textStyle,
      };
    }

    // Line-break fallback: shift down one line, snap to block's left edge
    return {
      anchorRect: {
        bottom: inputRect.top + lineHeightPx,
        left: blockRect.left - config.prefixInset,
        right: blockRect.right,
        top: inputRect.top + lineHeightPx,
      } satisfies FloatingPopoverAnchorRect,
      inputOffsetLeft: 0,
      prefixInset: config.prefixInset,
      inputPaddingLeft: config.inputPaddingLeft,
      width: Math.max(minWidth, blockRect.width + config.prefixInset),
      fontSize: config.fontSize,
      lineHeight: `${lineHeightPx}px`,
      textStyle,
    };
  }, [activeMatch, editor]);

  const anchor = useMemo(() => {
    if (!activeMatch) {
      return null;
    }

    return {
      contextElement: editor.view.dom,
      getBoundingClientRect: () =>
        normalizeAnchorRect(
          activeBlockVisualState?.anchorRect ??
            activeMatch.inputAnchorRect ??
            activeMatch.anchorRect,
        ),
    };
  }, [activeBlockVisualState?.anchorRect, activeMatch, editor.view.dom]);

  if (!anchor) {
    return null;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeAndClear())}
      modal={false}
    >
      <PopoverContent
        anchor={anchor}
        align="start"
        positionMethod="fixed"
        side="bottom"
        sideOffset={0}
        className="rounded-none border-none bg-transparent p-0! w-auto! gap-0 ring-0 shadow-none"
      >
        <Command
          shouldFilter={false}
          className="rounded-none! border-none bg-transparent p-0 w-auto! h-auto!"
          style={{
            marginLeft: activeBlockVisualState?.inputOffsetLeft ?? 0,
            width: activeBlockVisualState?.width ?? 320,
          }}
        >
          <div className="relative mb-2">
            {activeMatch?.inputPrefix ? (
              <span
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-pre"
                style={{
                  ...activeBlockVisualState?.textStyle,
                  left: `${activeBlockVisualState?.prefixInset ?? 0}px`,
                }}
              >
                {activeMatch.inputPrefix}
              </span>
            ) : null}
            <CommandInput
              ref={inputRef}
              value={search}
              inputGroupClassName="h-auto w-auto rounded-xl border-none shadow-none ring-1 ring-border/40 bg-input"
              inputWrapperClassName="p-0"
              className={cn(
                "h-auto border-none bg-transparent py-0 pr-3 placeholder:text-muted-foreground/70",
                activeMatch?.inputPrefix ? undefined : "pl-3",
              )}
              style={{
                ...activeBlockVisualState?.textStyle,
                height: activeBlockVisualState?.lineHeight,
                paddingLeft: activeMatch?.inputPrefix
                  ? `${activeBlockVisualState?.inputPaddingLeft ?? 7}px`
                  : undefined,
              }}
              withAddonIcon={false}
              onValueChange={setSearch}
              placeholder="Type to search"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeAndClear();
                  return;
                }

                if (
                  event.key === "Backspace" &&
                  searchRef.current.length === 0
                ) {
                  event.preventDefault();
                  cancelTrigger();
                }
              }}
            />
          </div>
          <CommandList className="max-h-[300px] rounded-lg border border-border/80 bg-popover">
            {filtered.length === 0 ? (
              <CommandGroup
                heading={
                  <div className="text-xs font-semibold text-muted-foreground">
                    No results found
                  </div>
                }
              >
                <CommandItem
                  value="Close menu"
                  onSelect={() => closeAndClear()}
                  className={cn(
                    "gap-0 h-8 pl-1.5 pr-0 py-0 aria-selected:ring-2 aria-selected:ring-primary",
                  )}
                >
                  <div className="flex flex-1 items-center gap-2">
                    Close menu
                  </div>
                  <kbd className="ml-auto text-xs text-muted-foreground">
                    esc
                  </kbd>
                </CommandItem>
              </CommandGroup>
            ) : (
              filtered.map((group, groupIndex) => (
                <CommandGroup
                  key={`${group.group}-${groupIndex}`}
                  heading={
                    <div className="text-xs font-semibold text-muted-foreground">
                      {group.group}
                    </div>
                  }
                >
                  {group.items.map((item, itemIndex) => (
                    <CommandItem
                      key={`${group.group}-${item.title}-${itemIndex}`}
                      value={`${item.title} ${item.keywords}`}
                      onSelect={() => executeCommand(item.command)}
                      className={cn(
                        "gap-0 h-8 pl-1.5 pr-0 py-0 aria-selected:ring-2 aria-selected:ring-primary",
                      )}
                    >
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex size-7 items-center justify-center text-muted-foreground/80">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                      </div>
                      {item.kbd ? (
                        <kbd className="ml-auto text-xs text-muted-foreground">
                          {item.kbd}
                        </kbd>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
