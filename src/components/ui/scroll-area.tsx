"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  thumbClassName?: string;
  viewportClassName?: string;
  rootRef?: React.Ref<HTMLDivElement>;
  viewportRef?: React.Ref<HTMLDivElement>;
}

function ScrollArea({
  className,
  children,
  thumbClassName,
  viewportClassName,
  rootRef,
  viewportRef,
  ...props
}: ScrollAreaProps) {
  const viewportDataId = props.id ? `${props.id}-viewport` : undefined;
  const scrollbarDataId = props.id ? `${props.id}-scrollbar` : undefined;

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      data-slot="scroll-area"
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-id={viewportDataId}
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full min-h-0 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar dataId={scrollbarDataId} thumbClassName={thumbClassName} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

interface ScrollBarProps extends ScrollAreaPrimitive.Scrollbar.Props {
  dataId?: string;
  thumbClassName?: string;
}
function ScrollBar({
  className,
  dataId,
  orientation = "vertical",
  thumbClassName,
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-id={dataId}
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px opacity-0 transition-opacity duration-150 ease-out select-none hover:opacity-100 data-scrolling:opacity-100 data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn("relative flex-1 rounded-full bg-border", thumbClassName)}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
