import { TeamJam } from "@/features/team-jam";
import useActiveJamId from "@/hooks/use-active-jam-id";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import usePrefetchJam from "@/hooks/use-prefetch-jam";
import { startJam, stopJam } from "@/lib/client/api/bout.ts";
import { TeamString } from "@/lib/client/api/jam";
import { getSeries } from "@/lib/client/api/series.ts";
import { useContext } from "react";
import { BoutIdContext } from "../provider";
import JamController from "@/features/jam-controller";

const TEAMS: [TeamString, TeamString] = ["home", "away"];

export function ScoreboardOperator() {
  const [boutId] = useContext(BoutIdContext);
  const lastestJamId = useLatestJamId(boutId);
  const activeJamId = useActiveJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? lastestJamId;
  usePrefetchJam(boutId, lastestJamId);

  return (
    <div className="place-items-center w-full">
      <JamController boutId={boutId}>
        {TEAMS.map((team: TeamString) => (
          <TeamJam
            key={team}
            periodNum={periodNum}
            jamNum={jamNum}
            team={team}
          />
        ))}
      </JamController>
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
