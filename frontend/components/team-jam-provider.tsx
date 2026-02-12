import { Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { JamContext, TeamJamContext } from "@/utils/contexts";
import { PropsWithChildren, useContext } from "react";

interface TeamJamProviderProps extends PropsWithChildren {
  team: Team;
}

export default function TeamJamProvider({
  team,
  children,
}: TeamJamProviderProps) {
  const jam: Jam | null = useContext(JamContext);
  if (jam == null) {
    throw new Error("TeamJamProvider must be used within a JamProvider");
  }
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamNum === team.num,
  );
  if (teamJam == undefined) {
    throw new Error("TeamJam not found");
  }

  return <TeamJamContext value={teamJam}>{children}</TeamJamContext>;
}
