// import useActiveJamId from "@/hooks/use-active-jam-id";
// import useLatestJamId from "@/hooks/use-latest-jam-id";
// import usePrefetchJam from "@/hooks/use-prefetch-jam";
// import { useRef } from "react";
// import { BoutIdContext } from "../provider";
import TripScroll from "@/components/TripScroll";
import { startJam } from "@/lib/client/api/bout.ts";
import { getSeries } from "@/lib/client/api/series.ts";
// import Clock from "@/components/Clock";

export function ScoreboardOperator() {
  // const [boutId] = useContext(BoutIdContext);
  // const lastestJamId = useLatestJamId(boutId)!;
  // const activeJamId = useActiveJamId(boutId);
  // usePrefetchJam(boutId, lastestJamId);
  // const [periodNum, jamNum] = activeJamId ?? lastestJamId;

  return <TripScroll />;
}

void getSeries().then((series) => {
  const boutId: string = series[0].id;

  setTimeout(() => {
    void startJam(boutId).then(() => {
      // setTimeout(() => {
      //   void stopJam(boutId);
      // }, 3000);
    });
  }, 1000);
});
