import { BoutIdContext } from "@/app/provider";
import useActiveJamId from "@/hooks/use-active-jam-id";
import useBout from "@/hooks/use-bout";
import useJam from "@/hooks/use-jam";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import { TeamString, Trip } from "@/lib/client/api/jam";
import { useContext } from "react";

interface TeamScoreProps {
  boutId?: string;
  team: TeamString;
  divider?: string
}

export default function TeamScore({ boutId, team, divider = "" }: TeamScoreProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const lastestJamId = useLatestJamId(boutId);
  const activeJamId = useActiveJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? lastestJamId;
  const trips: Trip[] = useJam(boutId, periodNum, jamNum)[team].score.trips;

  const teamScore: number = useBout(boutId, (bout) => bout[team].score);
  const jamScore: number = trips.reduce(
    (score, trip) => trip.points + score,
    0
  );

  return (
    <div className="flex flex-row justify-center place-items-center gap-2">
      <div className="content-center w-full font-bold text-7xl text-right">
        {teamScore}
      </div>
      <div className="content-center w-min text-4xl text-center">{divider}</div>
      <div className="content-center w-full text-4xl text-left">{jamScore}</div>
    </div>
  );
}
