import { useDeferredValue, useEffect, useState } from "react";
import useScore from "../../../hooks/useScore";
import { ScoreType } from "../types/ScoreType";
import { JamIdType } from "../../../types/JamIdType";

export default function useTripIndex(boutId: string, jamId: JamIdType, team: "home" | "away"): [number, React.Dispatch<React.SetStateAction<number>>] {
  const score: ScoreType = useScore(boutId, jamId, team);
  const [tripIndex, setTripIndex] = useState<number>(score.trips.length);
  const deferredScore = useDeferredValue(score);

  useEffect(() => {
    if (tripIndex == deferredScore.trips.length) {
      setTripIndex(score.trips.length)
    }
  }, [tripIndex, deferredScore.trips.length, score.trips.length])

  return [tripIndex, setTripIndex]
}