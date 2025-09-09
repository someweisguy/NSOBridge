import { BoutContext, Team } from "@/lib/bout";
import { PropsWithChildren } from "react";
import ScoreView from "./score-view";
import TimeoutBar from "./timeout-bar";

interface TeamsViewProps {
  team: Team;
  context: BoutContext;
}

export default function TeamView({
  team,
  context,
  children,
}: PropsWithChildren<TeamsViewProps>) {
  // FIXME: Use Roster name, not roster ID
  return (
    <div className="justify-around grid grid-flow-col w-full">
      <div className="place-items-center gap-7 grid grid-flow-row">
        <div className="text-5xl text-center">{team.rosterId}</div>
        <div className="grid grid-flow-col w-56">
          <TimeoutBar {...team} {...context} />
          <ScoreView {...team} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
