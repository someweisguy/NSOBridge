import { useEffect, useState } from "react";
import usePlayState from "./usePlayState";
import useClock from "../../../hooks/useClock";
import { BoutIdType } from "../../../types/BoutIdType";

export default function useIntermissionIsReady(boutId: BoutIdType) {
  // Determine if the Intermission is ready to start

  const periodClockSnapshot = useClock(boutId, "period");
  const [lastPeriodClockSnapshot, setLastPeriodClockSnapshot] = useState(
    window.performance.now()
  );

  const playState = usePlayState(boutId);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Update the lastPeriodClockSnapshot when the periodClockSnapshot changes
  useEffect(() => {
    setLastPeriodClockSnapshot(window.performance.now());
  }, [periodClockSnapshot]);

  // Allow intermission to start when the period is almost over
  useEffect(() => {
    const remaining =
      periodClockSnapshot.alarm! -
      periodClockSnapshot.elapsed -
      (periodClockSnapshot.isRunning
        ? window.performance.now() - lastPeriodClockSnapshot
        : 0);
    if (remaining < 5000 && ["stopped", "lineup"].includes(playState)) {
      setIsReady(true);
      return;
    }

    if (periodClockSnapshot.isRunning) {
      const timeoutId = setTimeout(() => {
        if (playState === "lineup") {
          setIsReady(true);
        }
      }, remaining - 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [periodClockSnapshot, playState, lastPeriodClockSnapshot]);

  return isReady;
}
