import { BoutContext, Team } from "@/features/game/bouts/types";
import { PropsWithChildren } from "react";
import ScoreView from "./score-view";
import TimeoutBar from "./timeout-bar";
import { Roster } from "@/features/game/rosters/types";
import useRoster from "@/features/game/rosters/hooks/use-roster";

interface TeamsViewProps {
  team: Team;
  context: BoutContext;
}

export default function TeamView({
  team,
  context,
  children,
}: PropsWithChildren<TeamsViewProps>) {
  const roster: Roster = useRoster(team.rosterId);
  return (
    <div className="place-content-stretch gap-7 grid grid-cols-3 p-4">
      <div className="place-content-center col-span-full font-bold text-7xl text-center">
        {roster.name}
      </div>
      <div className="justify-center items-center grid">
        <TimeoutBar {...team} {...context} />
      </div>
      <div className="justify-stretch items-center grid">
        <ScoreView {...team} />
      </div>
      <div className="justify-center items-center grid">
        {/* TODO: Jammer Status Icon */}
      </div>
      {children && <div className="col-span-full row-start-3">{children}</div>}
    </div>
  );
}
