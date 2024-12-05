import { useCallback, useEffect, useState } from "react";
import useBout from "../../../hooks/useBout";
import { JamNavigationType } from "../types/JamNavigationType";
import { JamIdType } from "../../../types/JamIdType";
import { BoutType } from "../../../types/BoutType";

export default function useJamNavigation(boutId: string): JamNavigationType {
  const bout: BoutType = useBout(boutId);

  const [currentJamId, setCurrentJamId] = useState<JamIdType>(() => {
    const periodIndex: number = Number(bout.numJams[1] > 0);
    const jamIndex: number = bout.numJams[periodIndex] - 1;
    return [periodIndex, jamIndex]
  });

  const [nextJamExists, setNextJamExists] = useState<boolean>(false);
  const [previousJamExists, setPreviousJamExists] = useState<boolean>(false);

  useEffect(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    setNextJamExists(currentJamIndex + 1 < bout.numJams[currentPeriodIndex]
      || (currentPeriodIndex == 0 && bout.numJams[1] > 0));
    setPreviousJamExists(currentJamIndex > 0 || currentPeriodIndex > 0);
  }, [currentJamId, bout.numJams]);

  const goToNextJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex + 1 < bout.numJams[currentPeriodIndex]) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex + 1]);
    } else if (currentPeriodIndex == 0 && bout.numJams[1] > 0) {
      setCurrentJamId([1, 0]);
    }
  }, [currentJamId, bout.numJams]);

  const goToPreviousJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex > 0) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex - 1]);
    } else if (currentPeriodIndex > 0) {
      setCurrentJamId([0, bout.numJams[0] - 1]);
    }
  }, [currentJamId, bout.numJams]);

  const goToCustomJam = useCallback((periodIndex: number, jamIndex: number) => {
    if (periodIndex > 1 || jamIndex >= bout.numJams[periodIndex]) {
      throw Error(`Jam [${periodIndex}, ${jamIndex}] does not exist`);
    }
    setCurrentJamId([periodIndex, jamIndex]);
  }, [bout.numJams]);

  return {
    currentJamId, nextJamExists, goToNextJam, previousJamExists,
    goToPreviousJam, goToCustomJam
  };
}