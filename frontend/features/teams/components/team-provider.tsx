import { Team } from "@/lib/game/bouts";
import { TeamContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface TeamProviderProps extends PropsWithChildren {
  team: Team;
}

export default function TeamProvider({ team, children }: TeamProviderProps) {
  return <TeamContext value={team}>{children}</TeamContext>;
}
