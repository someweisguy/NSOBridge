import { useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import useBout from "../../../hooks/useBout";
import useActiveJamId from "../../../hooks/useActiveJamId";
import useScore from "../../../hooks/useScore";
import { BoutIdType } from "../../../types/bout";
import TimeoutCard from "@/components/timeout-card";
import BoutScore from "@/components/bout-score";

export default function ScoreViewer({ team }: { team: "home" | "away" }) {
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
      <div className="p-4 text-4xl">{teamString}</div>

      <div className="flex flex-row justify-center">
        <TimeoutCard
          activeTimeout="officialReview"
          timeoutsRemaining={3}
          officialReviewsRemaining={1}
        />
        <BoutScore gameScore={score} jamScore={activeJamScore} />
      </div>
    </div>
  );
}
