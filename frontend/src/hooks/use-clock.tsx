import { getServerTime } from "@/lib/sync";
import { useEffect, useState } from "react";
import useServerOffset from "./use-server-offset";

interface ClockObject {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
}

export default function useClock(
  { startTimestamp, stopTimestamp, elapsed = 0, alarm }: ClockObject,
  run = true,
  refreshPeriod = 50
) {
  const { offset } = useServerOffset();
  const [serverTime, setServerTime] = useState<Date>(getServerTime(offset));

  useEffect(() => {
    if (startTimestamp === null || stopTimestamp || !run) {
      return; // Clock is not running
    }

    const intervalId = setInterval(() => {
      setServerTime(getServerTime(offset));
    }, refreshPeriod);
    return () => clearInterval(intervalId);
  }, [startTimestamp, stopTimestamp, run, refreshPeriod, offset]);

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

  return elapsed;
}
