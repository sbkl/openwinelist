import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const activeBlockKey = new PluginKey("activeBlock");

export const ActiveBlock = Extension.create({
  name: "activeBlock",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: activeBlockKey,

        props: {
          decorations(state) {
            const { doc, selection } = state;
            const { $from } = selection;

            let blockDepth = $from.depth;

            while (blockDepth > 0) {
              const node = $from.node(blockDepth);

              if (node.isTextblock) break;
              blockDepth -= 1;
            }

            const node = $from.node(blockDepth);
            if (!node?.isTextblock) {
              return DecorationSet.empty;
            }

            const from = $from.start(blockDepth) - 1;
            const to = from + node.nodeSize;

            return DecorationSet.create(doc, [
              Decoration.node(from, to, {
                "data-active-block": "true",
              }),
            ]);
          },
        },
      }),
    ];
  },
});
