import { BoutContext, Team } from "@/lib/bout";
import { PropsWithChildren } from "react";
import ScoreView from "./score-view";
import TimeoutBar from "./timeout-bar";
import { Roster } from "@/lib/roster";
import useRoster from "@/hooks/use-roster";

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
      <div className="place-content-center col-span-full text-5xl text-center">
        {roster.name}
      </div>
      <div className="place-items-center col-span-1">
        <TimeoutBar {...team} {...context} />
      </div>
      <div className="col-span-1">
        <ScoreView {...team} />
      </div>
      {/* <div className="col-span-1">
          .
      </div> */}
      {children && <div className="col-span-full row-start-3">{children}</div>}
    </div>
  );
}
