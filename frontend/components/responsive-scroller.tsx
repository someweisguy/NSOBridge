import {
  Button,
  ButtonProps,
  Group,
  ScrollArea,
  ScrollAreaAutosizeProps,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const arrowButtonStyle: ButtonProps = {
  p: 0,
  variant: "subtle",
  c: "gray",
  h: "full",
  w: 30,
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
  w = 200,
  children,
  ...props
}: ScrollAreaAutosizeProps) {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [disableScrollRight, setDisableScrollRight] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // It is required to recompute a scroll amount each time the X position changes
  // because smooth scrolling does not always perfectly scroll to the desired location
  const scrollByOneChild = useCallback(
    (direction: "left" | "right") => {
      if (groupRef.current == null) {
        return;
      }
      const numChildren = groupRef.current.children.length;
      const childWidth = Math.round(groupRef.current.scrollWidth) / numChildren;
      const scrollAmount = direction == "left" ? -childWidth : childWidth;

      // Normalize the scroll position to be a multiple of the child width
      let left = Math.round(scrollPosition.x) + scrollAmount;
      if (direction == "left") {
        left += left % childWidth;
      } else {
        left -= left % childWidth;
      }

      viewportRef.current?.scrollTo({
        behavior: "smooth",
        left,
      });
    },
    [scrollPosition.x],
  );

  // Scroll to end when an item is added or removed or when the page initially loads
  useEffect(() => {
    viewportRef.current?.scrollTo({
      behavior: "smooth",
      left: viewportRef.current.scrollWidth,
    });
  }, [children]);

  return (
    <Group gap="5px" justify="center" wrap="nowrap">
      <Button
        className={twMerge(scrollPosition.x == 0 && "invisible")}
        disabled={scrollPosition.x == 0}
        onClick={() => scrollByOneChild("left")}
        {...arrowButtonStyle}
        pr={1}
      >
        <IconChevronLeft size="24" />
      </Button>
      <ScrollArea.Autosize
        type="never"
        onScrollPositionChange={(newPosition) => {
          setScrollPosition(newPosition);
          setDisableScrollRight(
            Math.round(newPosition.x) +
              (viewportRef.current?.offsetWidth ?? 0) ==
              groupRef.current?.scrollWidth,
          );
        }}
        viewportRef={viewportRef}
        w={w}
        mih={60}
        {...props}
      >
        <Group ref={groupRef} gap="xs" wrap="nowrap">
          {children}
        </Group>
      </ScrollArea.Autosize>
      <Button
        className={twMerge(disableScrollRight && "invisible")}
        disabled={disableScrollRight}
        onClick={() => scrollByOneChild("right")}
        {...arrowButtonStyle}
        pl={1}
      >
        <IconChevronRight size="24" />
      </Button>
    </Group>
  );
}
