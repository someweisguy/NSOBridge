import TripEvent from "@/components/trip-event";
import { Jam, Team, TeamJam } from "@/types/game";
import { Button, Group, ScrollArea } from "@mantine/core";
import { useEffect, useRef } from "react";
import AddTripButtons from "./add-trip-buttons";

interface TeamJamViewProps {
  jam: Jam;
  team: Team;
}

export default function TeamJamView({ jam, team }: TeamJamViewProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamId === team.id,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }
  const viewport = useRef<HTMLDivElement>(null);
  const isHydrated = useRef<boolean>(false);

  useEffect(() => {
    const behavior = isHydrated.current ? "smooth" : "instant";
    viewport.current!.scrollTo({
      left: viewport.current!.scrollWidth,
      behavior,
    });
    isHydrated.current = true;
  }, [teamJam.events.length]);

  return (
    <>
      <AddTripButtons jam={jam} team={team} />

      <Group gap={0} justify="center" wrap="nowrap">
        <Button p={0} pr={1} variant="subtle" h={60} w={30}>
          <ChevronLeft />
        </Button>
        <ScrollArea.Autosize
          h={60}
          w={200}
          viewportRef={viewport}
          scrollbars={false}
        >
          <Group gap={0} preventGrowOverflow={false} wrap="nowrap">
            {teamJam.events
              .filter((event) => event.passes != null)
              .map((teamJam, i) => (
                <TripEvent key={i} tripNum={i} {...teamJam} />
              ))}
          </Group>
        </ScrollArea.Autosize>
        <Button p={0} pl={1} variant="subtle" h={60} w={30}>
          <ChevronRight />
        </Button>
      </Group>
    </>
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
