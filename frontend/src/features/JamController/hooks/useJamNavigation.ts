import { useCallback, useEffect, useState } from "react";
import { JamNavigationType } from "../types/JamNavigationType";
import { JamIdType } from "../../../types/JamIdType";
import { BoutType } from "../../../types/BoutType";
import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../../../app/client";
import { keyFactory } from "../../../utils/keyFactory";

export default function useJamNavigation(boutId: string): JamNavigationType {
  const { data: numJams } = useSuspenseQuery<
    BoutType,
    unknown,
    [number, number]
  >({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => dispatch("bout", "get", { boutId }),
    select: (data: BoutType) => data.numJams,
  });

  const [currentJamId, setCurrentJamId] = useState<JamIdType>(() => {
    const periodIndex: number = Number(numJams[1] > 0);
    const jamIndex: number = numJams[periodIndex] - 1;
    return [periodIndex, jamIndex];
  });

  const [nextJamExists, setNextJamExists] = useState<boolean>(false);
  const [previousJamExists, setPreviousJamExists] = useState<boolean>(false);

  useEffect(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    setNextJamExists(
      currentJamIndex + 1 < numJams[currentPeriodIndex] ||
        (currentPeriodIndex == 0 && numJams[1] > 0)
    );
    setPreviousJamExists(currentJamIndex > 0 || currentPeriodIndex > 0);
  }, [currentJamId, numJams]);

  const goToNextJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex + 1 < numJams[currentPeriodIndex]) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex + 1]);
    } else if (currentPeriodIndex == 0 && numJams[1] > 0) {
      setCurrentJamId([1, 0]);
    }
  }, [currentJamId, numJams]);

  const goToPreviousJam = useCallback(() => {
    const [currentPeriodIndex, currentJamIndex] = currentJamId;
    if (currentJamIndex > 0) {
      setCurrentJamId([currentPeriodIndex, currentJamIndex - 1]);
    } else if (currentPeriodIndex > 0) {
      setCurrentJamId([0, numJams[0] - 1]);
    }
  }, [currentJamId, numJams]);

  const goToCustomJam = useCallback(
    (periodIndex: number, jamIndex: number) => {
      if (periodIndex > 1 || jamIndex >= numJams[periodIndex]) {
        throw Error(`Jam [${periodIndex}, ${jamIndex}] does not exist`);
      }
      setCurrentJamId([periodIndex, jamIndex]);
    },
    [numJams]
  );

  return {
    currentJamId,
    nextJamExists,
    goToNextJam,
    previousJamExists,
    goToPreviousJam,
    goToCustomJam,
  };
}
