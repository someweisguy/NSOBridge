import TeamJamTrips from "@/components/team-jam-trips";
import { Jam, Team, TeamJam } from "@/types/game";
import { Stack } from "@mantine/core";
import TeamJamJammerState from "../../components/team-jam-jammer-state";
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

  return (
    <Stack>
      <TeamJamJammerState teamJam={teamJam} />
      <AddTripButtons jam={jam} team={team} />
      <TeamJamTrips teamJam={teamJam} scrollWidth={200} />
    </Stack>
  );
}
