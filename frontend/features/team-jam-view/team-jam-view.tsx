import { Jam, Team, TeamJam } from "@/types/game";
import { Stack } from "@mantine/core";
import AddTripButtons from "./add-trip-buttons";
import TripEventView from "./trip-event-view";
import JammerStatusButtons from "./jammer-status-buttons";

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
      <JammerStatusButtons teamJam={teamJam} />
      <AddTripButtons jam={jam} team={team} />
      <TripEventView teamJam={teamJam} scrollWidth={200} />
    </Stack>
  );
}
