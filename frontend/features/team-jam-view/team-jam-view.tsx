import { Jam, Team, TeamJam } from "@/types/game";
import { Stack } from "@mantine/core";
import { useEffect, useRef } from "react";
import AddTripButtons from "./add-trip-buttons";
import TripEventView from "./trip-event-view";

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
    <Stack>
      <AddTripButtons jam={jam} team={team} />
      <TripEventView jam={jam} team={team} />
    </Stack>
  );
}
