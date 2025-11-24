import { BoutContext, Team } from "@/shared/features/game/bouts/types";
import useRoster from "@/shared/features/game/rosters/hooks/use-roster";
import { Roster } from "@/shared/features/game/rosters/types";
import { PropsWithChildren } from "react";
import ScoreView from "./score-view";
import TimeoutBar from "./timeout-bar";
// import useTimeout from "@/features/game/timeouts/hooks/use-timeout";

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
        {/* FIXME: get the activeTimeout type by querying the latest Timeout */}
        <TimeoutBar {...team} {...context} activeTimeout={null} />
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
