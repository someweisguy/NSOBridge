import { BoutIdContext } from "@/app/provider";
import TeamName from "@/components/team-name";
import TeamScore from "@/components/team-score";
import TimeoutBar from "@/components/timeout-pips";
import TripView from "@/components/trip-view";
import { TeamString } from "@/lib/client/api/types";
import { useContext } from "react";

interface TeamJamProps {
  boutId?: string;
  periodNum: number;
  jamNum: number;
  team: TeamString;
}

export function TeamJam({ boutId, periodNum, jamNum, team }: TeamJamProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  return (
    <div className="justify-center content-center grid grid-flow-row p-8">
      <TeamName team={team} />
      <div className="grid grid-cols-2">
        <TimeoutBar team={team} />
        <TeamScore team={team} />
      </div>
      <TripView periodNum={periodNum} jamNum={jamNum} team={team} />
    </div>
  );
}
