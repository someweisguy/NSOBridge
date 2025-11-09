import useServerOffset from "@/hooks/use-server-offset";
import { getServerTime } from "@/lib/sync";
import { useCallback, useEffect, useState } from "react";

interface ClockObject {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
}

export default function useClock(
  { startTimestamp, stopTimestamp, elapsed = 0, alarm }: ClockObject,
  run = true,
  refreshPeriod = 50,
): [number, () => void] {
  const { offset } = useServerOffset();
  const [serverTime, setServerTime] = useState<Date>(getServerTime(offset));

  // Define a callback that can be used to refresh the clock value
  const refreshClock = useCallback(
    () => setServerTime(getServerTime(offset)),
    [offset],
  );

  useEffect(() => {
    if (startTimestamp === null || stopTimestamp || !run) {
      return; // Clock is not running
    }

    const intervalId = setInterval(() => refreshClock(), refreshPeriod);
    return () => clearInterval(intervalId);
  }, [startTimestamp, stopTimestamp, run, refreshPeriod, refreshClock]);

  // Compute the amount of time that has elapsed
  if (startTimestamp !== null) {
    let computeTimestamp = stopTimestamp ?? serverTime;
    if (computeTimestamp < startTimestamp) {
      computeTimestamp = startTimestamp;
    }
    elapsed += computeTimestamp.getTime() - startTimestamp.getTime();
  }

  // Display the Clock value as a countdown if there is an alarm defined
  if (alarm !== undefined) {
    elapsed = alarm - elapsed;
  }

  return [elapsed, refreshClock];
}
