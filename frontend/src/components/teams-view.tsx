import { BoutContext, Team } from "@/lib/bout";
import ScoreView from "./score-view";
import TimeoutBar from "./timeout-bar";
import { PropsWithChildren } from "react";
import { TeamContext } from "./contexts";

interface TeamsViewChild extends Element {
  team: Team;
  context: BoutContext;
  index: number;
}

interface TeamsViewProps {
  teams: Team[];
  context: BoutContext;
  peer?: React.ReactNode
}

export default function TeamsView({
  teams,
  context,
  peer = (<></>),
}: TeamsViewProps) {
  return (
    <div className="justify-around grid grid-flow-col w-full">
      {teams.map((team: Team, i: number) => (
        <div key={i} className="place-items-center gap-7 grid grid-flow-row">
          <div className="text-5xl text-center">{team.name}</div>
          <div className="grid grid-flow-col w-56">
            <TimeoutBar {...team} {...context} />
            <ScoreView {...team} />
          </div>
          <div>
            {peer}
          </div>
        </div>
      ))}
    </div>
  );
}
