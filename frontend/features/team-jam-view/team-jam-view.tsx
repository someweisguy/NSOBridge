import TripEvent from "@/components/trip-event";
import { Jam, Team, TeamJam } from "@/types/game";
import { Group, ScrollArea } from "@mantine/core";
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

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  return (
    <>
      <AddTripButtons jam={jam} team={team} />
      Lead: {String(lead)}, Lost: {String(lost)}, Star Pass: {String(starPass)}
      <ScrollArea.Autosize
        h={100}
        w={400}
        viewportRef={viewport}
        scrollbars="x"
      >
        <Group preventGrowOverflow={false} wrap="nowrap">
          {teamJam.events
            .filter((event) => event.passes != null)
            .map((teamJam, i) => (
              <TripEvent key={i} tripNum={i} {...teamJam} />
            ))}
        </Group>
      </ScrollArea.Autosize>
    </>
  );
}
