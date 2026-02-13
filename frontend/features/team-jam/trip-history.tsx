import { TeamJam } from "@/lib/game/jams";
import { Button, Group, ScrollArea } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import TripEvent from "./trip-event";

interface TripEventViewProps {
  teamJam: TeamJam;
  scrollWidth?: number;
}

function scrollLeft(scrollArea: HTMLDivElement) {
  scrollArea.scrollBy({ left: -50.5, behavior: "smooth" });
}

function scrollRight(scrollArea: HTMLDivElement) {
  scrollArea.scrollBy({ left: 50.5, behavior: "smooth" });
}

export default function TeamJamTripHistory({
  teamJam,
  scrollWidth = 200,
}: TripEventViewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const isHydrated = useRef<boolean>(false);
  const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const behavior = isHydrated.current ? "smooth" : "instant";
    viewport.current!.scrollTo({
      left: viewport.current!.scrollWidth,
      behavior,
    });
    isHydrated.current = true;
  }, [teamJam.events.length]);

  return (
    <Group gap={0} justify="center" wrap="nowrap">
      <Button
        disabled={scrollPosition.x == 0}
        onClick={() => scrollLeft(viewport.current!)}
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
        onScrollPositionChange={onScrollPositionChange}
        viewportRef={viewport}
        h={60}
        w={scrollWidth}
      >
        <Group mx={0} gap={0} preventGrowOverflow={false} wrap="nowrap">
          {teamJam.events
            .filter((event) => event.passes != null)
            .map((teamJam, i) => (
              <TripEvent key={i} tripNum={i} {...teamJam} />
            ))}
        </Group>
      </ScrollArea.Autosize>
      <Button
        disabled={
          viewport.current == null ||
          viewport.current.scrollWidth <= scrollWidth ||
          scrollPosition.x >= viewport.current.scrollWidth - scrollWidth
        }
        onClick={() => scrollRight(viewport.current!)}
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
