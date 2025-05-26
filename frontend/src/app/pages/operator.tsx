import JamController from "@/features/jam-controller";
import { TeamJam } from "@/features/team-jam";
import useActiveJamId from "@/hooks/use-active-jam-id";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import usePrefetchJam from "@/hooks/use-prefetch-jam";
import { TeamString } from "@/lib/client/api/types";
import { useContext } from "react";
import { BoutIdContext } from "../provider";

const TEAMS: [TeamString, TeamString] = ["home", "away"];

export function ScoreboardOperator() {
  const [boutId] = useContext(BoutIdContext);
  const lastestJamId = useLatestJamId(boutId);
  const activeJamId = useActiveJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? lastestJamId;
  usePrefetchJam(boutId, lastestJamId);

  return (
    <div className="justify-items-center w-full">
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
