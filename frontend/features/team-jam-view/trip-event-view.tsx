import TripEvent from "@/components/trip-event";
import { TeamJam } from "@/types/game";
import { Button, Group, ScrollArea } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

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

export default function TripEventView({
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
        h={60}
        w={30}
      >
        <ChevronLeft />
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
        h={60}
        w={30}
      >
        <ChevronRight />
      </Button>
    </Group>
  );
}

function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon-tabler-chevron-left icons-tabler-outline icon icon-tabler"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 6l-6 6l6 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon-tabler-chevron-right icons-tabler-outline icon icon-tabler"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 6l6 6l-6 6" />
    </svg>
  );
}
