import TripEvent from "@/features/jams/components/trip-event";
import { TeamJam } from "@/lib/game/jams";
import { TeamJamContext } from "@/utils/contexts";
import { Button, Group, ScrollArea } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

interface TripEventViewProps {
  w?: number;
}

export default function TeamJamTripHistory({ w = 200 }: TripEventViewProps) {
  const teamJam: TeamJam | null = useContext(TeamJamContext);
  if (teamJam == null) {
    throw new Error("TeamJamTripHistory must be used within a TeamJamProvider");
  }

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [disableScrollRight, setDisableScrollRight] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to end
    viewportRef.current?.scrollTo({
      behavior: "smooth",
      left: viewportRef.current.scrollWidth,
    });
  }, [teamJam.events.length]);

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
    <Group gap={0} justify="center" wrap="nowrap">
      <Button
        disabled={scrollPosition.x == 0}
        onClick={() => scrollByOneChild("left")}
        p={0}
        pr={1}
        variant="subtle"
        c="gray"
        h="60"
        w={30}
      >
        <IconChevronLeft size="24" />
      </Button>
      <ScrollArea.Autosize
        type="never"
        onScrollPositionChange={(newPosition) => {
          setScrollPosition(newPosition);
          setDisableScrollRight(
            Math.round(newPosition.x) + w == groupRef.current?.scrollWidth,
          );
        }}
        viewportRef={viewportRef}
        h={60}
        w={w}
      >
        <Group ref={groupRef} mx={0} px={0} gap={0} wrap="nowrap">
          {teamJam.events
            .filter((event) => event.passes != null)
            .map((teamJam, i) => (
              <TripEvent key={i} tripNum={i} {...teamJam} />
            ))}
        </Group>
      </ScrollArea.Autosize>
      <Button
        disabled={disableScrollRight}
        onClick={() => scrollByOneChild("right")}
        p={0}
        pl={1}
        variant="subtle"
        c="gray"
        h="60"
        w="30"
      >
        <IconChevronRight size="24" />
      </Button>
    </Group>
  );
}
