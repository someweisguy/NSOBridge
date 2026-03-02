import TripEventButton from "@/components/trip-event-button";
import { TripEvent } from "@/lib/game/jams";
import {
  Button,
  ButtonProps,
  Group,
  ScrollArea,
  ScrollAreaAutosizeProps,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

const arrowButtonStyle: ButtonProps = {
  p: 0,
  variant: "subtle",
  c: "gray",
  h: "full",
  w: 30,
};

interface TeamJamTripHistoryProps extends ScrollAreaAutosizeProps {
  events: TripEvent[];
}

export default function TeamJamTripHistory({
  w = 200,
  events,
  ...props
}: TeamJamTripHistoryProps) {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [disableScrollRight, setDisableScrollRight] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to end
    viewportRef.current?.scrollTo({
      behavior: "smooth",
      left: viewportRef.current.scrollWidth,
    });
  }, [events.length]);

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

  return (
    <Group gap="5px" justify="center" wrap="nowrap">
      <Button
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
        {...props}
      >
        <Group ref={groupRef} mx={0} px={0} gap={0} wrap="nowrap">
          {events
            .filter((event) => event.passes != null)
            .map((teamJam, i) => (
              <TripEventButton key={i} tripNum={i} {...teamJam} />
            ))}
        </Group>
      </ScrollArea.Autosize>
      <Button
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
