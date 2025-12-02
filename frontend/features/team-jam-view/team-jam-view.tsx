import { Jam, Team, TeamJam } from "@/types/game";

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

  return <>TeamJam ID: {teamJam.id}</>;
}
