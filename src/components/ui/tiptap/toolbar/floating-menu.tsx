"use client";

import type { Editor, JSONContent } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Type,
} from "lucide-react";
import {
  type CommandGroupType,
  FloatingPopover,
  type FloatingPopoverTrigger,
} from "./floating-popover";

type BlockCommandType =
  | { type: "paragraph" | "bulletList" | "orderedList" }
  | { type: "heading"; level: 1 | 2 | 3 | 4 };

function getActiveTextblockDepth(editor: Editor) {
  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).isTextblock) {
      return depth;
    }
  }

  return null;
}

function getBlockCommandContext(editor: Editor) {
  const textblockDepth = getActiveTextblockDepth(editor);

  if (textblockDepth === null) {
    return null;
  }

  const { $from } = editor.state.selection;
  const textblockNode = $from.node(textblockDepth);
  const isTopLevelEmptyParagraph =
    textblockDepth === 1 &&
    textblockNode.type.name === "paragraph" &&
    textblockNode.textContent.length === 0;

  const insertionNode = $from.node(1);
  const insertionStart = $from.start(1) - 1;
  const insertionPos = insertionStart + insertionNode.nodeSize;

  return {
    insertionPos,
    shouldTransformCurrentBlock: isTopLevelEmptyParagraph,
  };
}

function buildInsertedBlockContent(command: BlockCommandType): JSONContent {
  switch (command.type) {
    case "paragraph":
      return { type: "paragraph" };
    case "heading":
      return {
        type: "heading",
        attrs: { level: command.level },
      };
    case "bulletList":
      return {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph" }],
          },
        ],
      };
    case "orderedList":
      return {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph" }],
          },
        ],
      };
  }
}

function getInsertedBlockSelectionOffset(command: BlockCommandType) {
  switch (command.type) {
    case "paragraph":
    case "heading":
      return 1;
    case "bulletList":
    case "orderedList":
      return 3;
  }
}

function runBlockCommand(editor: Editor, command: BlockCommandType) {
  const context = getBlockCommandContext(editor);

  if (!context) {
    return;
  }

  if (context.shouldTransformCurrentBlock) {
    const chain = editor.chain().focus(undefined, { scrollIntoView: false });

    switch (command.type) {
      case "paragraph":
        chain.clearNodes().run();
        return;
      case "heading":
        chain.setHeading({ level: command.level }).run();
        return;
      case "bulletList":
        chain.toggleBulletList().run();
        return;
      case "orderedList":
        chain.toggleOrderedList().run();
        return;
    }
  }

  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .insertContentAt(context.insertionPos, buildInsertedBlockContent(command))
    .setTextSelection(
      context.insertionPos + getInsertedBlockSelectionOffset(command),
    )
    .run();
}

const groups: CommandGroupType[] = [
  {
    group: "Typography",
    items: [
      {
        title: "Text",
        icon: Type,
        keywords: "paragraph text",
        kbd: null,
        command: (editor) => runBlockCommand(editor, { type: "paragraph" }),
      },
      {
        title: "Heading 1",
        icon: Heading1,
        keywords: "h1 title header #",
        kbd: "#",
        command: (editor) =>
          runBlockCommand(editor, { type: "heading", level: 1 }),
      },
      {
        title: "Heading 2",
        icon: Heading2,
        keywords: "h2 subtitle ##",
        kbd: "##",
        command: (editor) =>
          runBlockCommand(editor, { type: "heading", level: 2 }),
      },
      {
        title: "Heading 3",
        icon: Heading3,
        keywords: "h3 subheader ###",
        kbd: "###",
        command: (editor) =>
          runBlockCommand(editor, { type: "heading", level: 3 }),
      },
      {
        title: "Heading 4",
        icon: Heading4,
        keywords: "h4 subheader ####",
        kbd: "####",
        command: (editor) =>
          runBlockCommand(editor, { type: "heading", level: 4 }),
      },
    ],
  },
  // {
  //   group: "Decorations",
  //   items: [
  //     {
  //       title: "Bold",
  //       description: "Make text bold",
  //       icon: Bold,
  //       keywords: "bold",
  //       command: (editor) =>
  //         editor.isActive("heading")
  //           ? false
  //           : editor
  //               .chain()
  //               .focus(undefined, { scrollIntoView: false })
  //               .toggleBold()
  //               .run(),
  //     },
  //     {
  //       title: "Italic",
  //       description: "Make text italic",
  //       icon: Italic,
  //       keywords: "italic",
  //       command: (editor) =>
  //         editor
  //           .chain()
  //           .focus(undefined, { scrollIntoView: false })
  //           .toggleItalic()
  //           .run(),
  //     },
  //     {
  //       title: "Underline",
  //       description: "Underline text",
  //       icon: Underline,
  //       keywords: "underline",
  //       command: (editor) =>
  //         editor
  //           .chain()
  //           .focus(undefined, { scrollIntoView: false })
  //           .toggleUnderline()
  //           .run(),
  //     },
  //     {
  //       title: "Strikethrough",
  //       description: "Strikethrough text",
  //       icon: Strikethrough,
  //       keywords: "strikethrough",
  //       command: (editor) =>
  //         editor
  //           .chain()
  //           .focus(undefined, { scrollIntoView: false })
  //           .toggleStrike()
  //           .run(),
  //     },
  //   ],
  // },
  {
    group: "Lists",
    items: [
      {
        title: "Bullet List",
        icon: List,
        keywords: "unordered ul bullets -",
        kbd: "-",
        command: (editor) => runBlockCommand(editor, { type: "bulletList" }),
      },
      {
        title: "Numbered List",
        icon: ListOrdered,
        keywords: "numbered ol 1.",
        kbd: "1.",
        command: (editor) => runBlockCommand(editor, { type: "orderedList" }),
      },
    ],
  },
];

export function TipTapFloatingMenu({
  editor,
  trigger = "slash",
}: {
  editor: Editor;
  trigger?: FloatingPopoverTrigger;
}) {
  return <FloatingPopover editor={editor} groups={groups} trigger={trigger} />;
}
