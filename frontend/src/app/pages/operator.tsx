import TeamName from "@/components/team-name";
import TeamScore from "@/components/team-score";
import TimeoutBar from "@/components/timeout-pips";
import TripView from "@/components/trip-view";
import useActiveJamId from "@/hooks/use-active-jam-id";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import usePrefetchJam from "@/hooks/use-prefetch-jam";
import { startJam, stopJam } from "@/lib/client/api/bout.ts";
import { TeamString } from "@/lib/client/api/jam";
import { getSeries } from "@/lib/client/api/series.ts";
import { useContext } from "react";
import { BoutIdContext } from "../provider";

const TEAMS: [TeamString, TeamString] = ["home", "away"];

export function ScoreboardOperator() {
  const [boutId] = useContext(BoutIdContext);
  const lastestJamId = useLatestJamId(boutId)!;
  const activeJamId = useActiveJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? lastestJamId;
  usePrefetchJam(boutId, lastestJamId);

  return (
    <div className="justify-center content-center grid grid-flow-col">
      {TEAMS.map((team: TeamString) => {
        return (
          <div
            key={team}
            className="justify-center content-center grid grid-flow-row p-8"
          >
            <TeamName team={team} />
            <div className="grid grid-cols-2">
              <TimeoutBar team={team} />
              <TeamScore team={team} />
            </div>
            <TripView periodNum={periodNum} jamNum={jamNum} team={team} />
          </div>
        );
      })}
    </div>
  );
}

void getSeries().then((series) => {
  const boutId: string = series[0].id;

  setTimeout(() => {
    void startJam(boutId).then(() => {
      setTimeout(() => {
        void stopJam(boutId);
      }, 3000);
    });
  }, 1000);
});
