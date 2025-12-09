import { Jam, Team, TeamJam } from "@/types/game";
import { Stack } from "@mantine/core";
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

  return (
    <Stack>
      <AddTripButtons jam={jam} team={team} />
      <TripEventView events={teamJam.events} scrollWidth={200} />
    </Stack>
  );
}
