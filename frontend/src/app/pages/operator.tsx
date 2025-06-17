import JamController from "@/features/jam-controller";
import { TeamJam } from "@/features/team-jam";
import useBout, {
  selectActiveJamId,
  selectLatestJamId,
} from "@/hooks/use-bout";
import usePrefetchJam from "@/hooks/use-prefetch-jam";
import { useContext } from "react";
import { BoutIdContext } from "../provider";


export function ScoreboardOperator() {
  const [boutId] = useContext(BoutIdContext);
  const activeJamId = useBout(boutId, selectActiveJamId());
  const latestJamId = useBout(boutId, selectLatestJamId());
  const [periodNum, jamNum] = activeJamId ?? latestJamId;
  usePrefetchJam(boutId, latestJamId);

  return (
    <div className="justify-items-center w-full">
      <JamController boutId={boutId}>
        {[...Array(2).keys()].map((team: number) => (
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
