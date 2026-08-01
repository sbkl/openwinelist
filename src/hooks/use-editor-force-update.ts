"use client";

import type { TiptapEditor } from "@/components/ui/tiptap/editor";
import * as React from "react";

export function useEditorForceUpdate(editor: TiptapEditor) {
  const [updateKey, setUpdateKey] = React.useState(1);

  // Force re-render when editor selection changes
  React.useEffect(() => {
    if (!editor) return;

    const update = () => {
      setUpdateKey((prev) => prev + 1);
    };

    editor.on("selectionUpdate", update);
    editor.on("update", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("update", update);
    };
  }, [editor]);

  return updateKey;
}
