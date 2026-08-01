"use client";

import type { TiptapEditor } from "@/components/ui/tiptap/editor";

export type EditorToolbarToggleAttribute =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "blockquote"
  | "bulletList"
  | "orderedList"
  | "heading"
  | "codeBlock"
  | "taskList"
  | "taskItem";

interface SelectionRange {
  from: number;
  to: number;
}

export function isToggleBlockedByContext(
  editor: TiptapEditor,
  attribute: EditorToolbarToggleAttribute,
) {
  return attribute === "bold" && editor.isActive("heading");
}

export function isToggleActive(
  editor: TiptapEditor,
  attribute: EditorToolbarToggleAttribute,
) {
  if (isToggleBlockedByContext(editor, attribute)) {
    return false;
  }

  return editor.isActive(attribute);
}

export function runToggleCommand(
  editor: TiptapEditor,
  attribute: EditorToolbarToggleAttribute,
  selection?: SelectionRange | null,
) {
  const chain = editor.chain().focus(undefined, { scrollIntoView: false });

  if (selection && selection.from !== selection.to) {
    chain.setTextSelection(selection);
  }

  switch (attribute) {
    case "bold":
      chain.toggleBold().run();
      break;
    case "italic":
      chain.toggleItalic().run();
      break;
    case "underline":
      chain.toggleUnderline().run();
      break;
    case "strike":
      chain.toggleStrike().run();
      break;
    case "code":
      chain.toggleCode().run();
      break;
    case "blockquote":
      chain.toggleBlockquote().run();
      break;
    case "bulletList":
      chain.toggleBulletList().run();
      break;
    case "orderedList":
      chain.toggleOrderedList().run();
      break;
    case "heading":
      chain.toggleHeading({ level: 1 }).run();
      break;
    case "codeBlock":
      chain.toggleCodeBlock().run();
      break;
    case "taskList":
      chain.toggleTaskList().run();
      break;
    default:
      break;
  }
}

export function canToggleCommand(
  editor: TiptapEditor,
  attribute: EditorToolbarToggleAttribute,
) {
  if (isToggleBlockedByContext(editor, attribute)) {
    return false;
  }

  try {
    const can = editor
      .can()
      .chain()
      .focus(undefined, { scrollIntoView: false });

    switch (attribute) {
      case "bold":
        return can.toggleBold().run();
      case "italic":
        return can.toggleItalic().run();
      case "underline":
        return can.toggleUnderline().run();
      case "strike":
        return can.toggleStrike().run();
      case "code":
        return can.toggleCode().run();
      case "blockquote":
        return can.toggleBlockquote().run();
      case "bulletList":
        return can.toggleBulletList().run();
      case "orderedList":
        return can.toggleOrderedList().run();
      case "heading":
        return can.toggleHeading({ level: 1 }).run();
      case "codeBlock":
        return can.toggleCodeBlock().run();
      case "taskList":
        return can.toggleTaskList().run();
      default:
        return false;
    }
  } catch {
    return false;
  }
}
