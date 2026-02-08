import TeamJamTrips from "@/features/team-jam-vew/team-jam-trips";
import { Bout, Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { JamContext } from "@/utils/contexts";
import { Stack } from "@mantine/core";
import { useContext } from "react";
import AddTripButtons from "./add-trip-buttons";
import TeamJamJammerState from "./team-jam-jammer-state";

interface TeamJamViewProps {
  bout: Bout;
  team: Team;
}

export default function TeamJamView({ team }: TeamJamViewProps) {
  const jam: Jam | null = useContext(JamContext);
  if (jam == null) {
    throw new Error("TeamJamView must be used within a JamProvider");
  }
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamNum === team.num,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }

  return (
    <Stack>
      <TeamJamJammerState jam={jam} team={team} />
      <AddTripButtons jam={jam} team={team} />
      <TeamJamTrips teamJam={teamJam} scrollWidth={200} />
    </Stack>
  );
}
