import useActiveJamId from "@/hooks/use-active-jam-id";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import usePrefetchJam from "@/hooks/use-prefetch-jam";
import { BoutIdContext } from "../provider";
import TripView from "@/components/trip-view";
import { startJam, stopJam } from "@/lib/client/api/bout.ts";
import { getSeries } from "@/lib/client/api/series.ts";
import { useContext } from "react";
import TeamScore from "@/components/team-score";
// import Clock from "@/components/Clock";

export function ScoreboardOperator() {
  const [boutId] = useContext(BoutIdContext);
  const lastestJamId = useLatestJamId(boutId)!;
  const activeJamId = useActiveJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? lastestJamId;
  usePrefetchJam(boutId, lastestJamId);


  return (
    <div className="justify-center content-center grid grid-flow-row p-8">
      <TeamScore team="home"/>
      <TripView periodNum={periodNum} jamNum={jamNum} team="home" />
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
