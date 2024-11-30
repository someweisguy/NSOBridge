import { useCallback, useEffect, useState } from "react";
import useBout, { BoutType } from "../../../hooks/bout";
import { JamId } from "../../../hooks/jam";
import { JamIndex } from "../types/JamIndex";

export default function useJamIndex(boutId: string): JamIndex {
  const bout: BoutType = useBout(boutId);

  const [currentJamId, setCurrentJamId] = useState<JamId>(() => {
    const periodIndex: number = Number(bout.jams.counts[1] > 0);
    const jamIndex: number = bout.jams.counts[periodIndex] - 1;
    return [periodIndex, jamIndex]
  });

  const [nextJamExists, setNextJamExists] = useState<boolean>(false);
  const [previousJamExists, setPreviousJamExists] = useState<boolean>(false);

  useEffect(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    setNextJamExists(currentJamIndex + 1 < bout.jams.counts[currentPeriodIndex]
      || (currentPeriodIndex == 0 && bout.jams.counts[1] > 0));
    setPreviousJamExists(currentJamIndex > 0 || currentPeriodIndex > 0);
  }, [currentJamId, bout.jams.counts]);

  const goToNextJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex + 1 < bout.jams.counts[currentPeriodIndex]) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex + 1]);
    } else if (currentPeriodIndex == 0 && bout.jams.counts[1] > 0) {
      setCurrentJamId([1, 0]);
    }
  }, [currentJamId, bout.jams.counts]);

  const goToPreviousJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex > 0) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex - 1]);
    } else if (currentPeriodIndex > 0) {
      setCurrentJamId([0, bout.jams.counts[0] - 1]);
    }
  }, [currentJamId, bout.jams.counts]);

  const goToCustomJam = useCallback((periodIndex: number, jamIndex: number) => {
    if (periodIndex > 1 || jamIndex >= bout.jams.counts[periodIndex]) {
      throw Error(`Jam [${periodIndex}, ${jamIndex}] does not exist`);
    }
    setCurrentJamId([periodIndex, jamIndex]);
  }, [bout.jams.counts]);

  return {
    currentJamId, nextJamExists, goToNextJam, previousJamExists,
    goToPreviousJam, goToCustomJam
  };
}