import {
  Button,
  ButtonProps,
  Group,
  Overlay,
  ScrollArea,
  ScrollAreaAutosizeProps,
} from "@mantine/core";
import { useScroller } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Children, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const arrowButtonStyle: ButtonProps = {
  p: 0,
  variant: "gradient",
  w: "2rem",
  c: "gray",
  h: "100%",
  radius: "0",
};

/**
 * A horizontal scroller that responds to changes in its children.
 *
 * This component is designed to work similarly to the Mantine Scroller component
 * released in v9.0 except this component responds to changes in its children. This
 * component prefers to display its most recent child, scrolling to it when a new child
 * is added.
 */
export default function ResponsiveScroller({
  children,
  ...props
}: ScrollAreaAutosizeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const childrenCount = useRef<number>(0);

  const scroller = useScroller();

  // Scroll to end when an item is added or when the page initially loads
  useEffect(() => {
    const newChildrenCount = Children.count(children);
    if (newChildrenCount > childrenCount.current) {
      viewportRef.current?.scrollTo({
        behavior: "smooth",
        left: viewportRef.current.scrollWidth,
      });
    }
    childrenCount.current = newChildrenCount;
  }, [children]);

  return (
    <ScrollArea.Autosize
      type="never"
      viewportRef={(node) => {
        // Use multiple refs to allow scroll to end
        scroller.ref(node);
        viewportRef.current = node;
      }}
      {...scroller.dragHandlers}
      {...props}
    >
      <Group gap="xs" m="xs" wrap="nowrap">
        {children}
      </Group>

      <Overlay backgroundOpacity={0} style={{ pointerEvents: "none" }}>
        <Group h="100%" justify="space-between" wrap="nowrap" p="0">
          <Button
            className={twMerge(!scroller.canScrollStart && "invisible")}
            gradient={{ from: "white", to: "transparent", deg: 90 }}
            onClick={scroller.scrollStart}
            style={{ pointerEvents: "all" }}
            {...arrowButtonStyle}
          >
            <IconChevronLeft size="24" />
          </Button>
          <Button
            className={twMerge(!scroller.canScrollEnd && "invisible")}
            gradient={{ from: "white", to: "transparent", deg: -90 }}
            onClick={scroller.scrollEnd}
            style={{ pointerEvents: "all" }}
            {...arrowButtonStyle}
          >
            <IconChevronRight size="24" />
          </Button>
        </Group>
      </Overlay>
    </ScrollArea.Autosize>
  );
}
