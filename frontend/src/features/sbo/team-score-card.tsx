import { ReactElement, useContext } from "react";
import TripEditor from "@/features/sbo/trip-editor";
import JammerState from "@/features/sbo/jammer-state";
import TimeoutPips from "@/components/timeout-pips";
import BoutScore from "@/components/bout-score";
import { BoutIdType } from "@/types/bout";
import { BoutIdContext } from "@/contexts/BoutIdContext";
import useBout from "@/hooks/useBout";
import useActiveJamId from "@/hooks/useActiveJamId";
import useScore from "@/hooks/useScore";

export default function TeamScoreCard({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  const boutId = useContext<BoutIdType>(BoutIdContext);

  const [teamName, score] = useBout<[string, number]>(boutId, (bout) => {
    return [bout.roster[team], bout.score[team]];
  });

  // Get the active Jam score
  const activeJamId = useActiveJamId(boutId);
  const activeJamScore = useScore(boutId, activeJamId, team, (score) =>
    score.trips.reduce((sum, trip) => (sum += trip.points), 0)
  );

  // Set the default team name if it is not provided
  let teamString: string = teamName!;
  if (teamName === null) {
    if (team === "home") {
      teamString = "Home";
    } else {
      teamString = "Away";
    }
  }

  return (
    <div className="grid grid-flow-row items-center p-4 overflow-hidden">
      <div className="p-4 text-4xl text-center">{teamString}</div>

      <div className="flex flex-row justify-center">
        <TimeoutPips
          activeTimeout="officialReview"
          timeoutsRemaining={3}
          officialReviewsRemaining={1}
        />
        <BoutScore gameScore={score} jamScore={activeJamScore} />
      </div>
      <div>
        <TripEditor team={team} />
        <JammerState team={team} />
      </div>
    </div>
  );
}
