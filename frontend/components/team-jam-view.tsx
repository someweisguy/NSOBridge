import TeamJamTrips from "@/components/team-jam-trips";
import { Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { RulesetContext } from "@/utils/contexts";
import { Stack } from "@mantine/core";
import { useContext } from "react";
import AddTripButtons from "./add-trip-buttons";
import TeamJamJammerState from "./team-jam-jammer-state";

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
  const ruleset = useContext(RulesetContext)!;

  return (
    <Stack>
      <TeamJamJammerState teamJam={teamJam} />
      <AddTripButtons jam={jam} team={team} ruleset={ruleset} />
      <TeamJamTrips teamJam={teamJam} scrollWidth={200} />
    </Stack>
  );
}
