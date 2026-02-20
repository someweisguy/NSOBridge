import { Jam, TeamJam } from "@/lib/game/jams";
import { JamContext, TeamJamContext } from "@/utils/contexts";
import { PropsWithChildren, useContext } from "react";

interface TeamJamProviderProps extends PropsWithChildren {
  teamJamNum: number;
}

export default function TeamJamProvider({
  teamJamNum,
  children,
}: TeamJamProviderProps) {
  const jam: Jam | null = useContext(JamContext);
  if (jam == null) {
    throw new Error("TeamJamProvider must be used within a JamProvider");
  }
  const teamJam: TeamJam | undefined = jam.teamJams[teamJamNum];
  if (teamJam == undefined) {
    throw new Error("TeamJam not found");
  }

  return <TeamJamContext value={teamJam}>{children}</TeamJamContext>;
}
