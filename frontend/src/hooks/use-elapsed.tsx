import { Alarm, Timer } from "@/lib/client/api/types";
import { useEffect, useState } from "react";

export default function useElapsed(
  clock: Alarm | Timer,
  { updateInterval = 1000 / 60, stopMillis = Number.MAX_VALUE } = {}
): number {
  const [lap, setLap] = useState(
    clock.startTimestamp !== null
      ? new Date().getTime() - clock.startTimestamp.getTime()
      : 0
  );

  useEffect(() => {
    if (clock.startTimestamp === null) {
      setLap(0); // The clock is not running
      return;
    }

    const newLap = new Date().getTime() - clock.startTimestamp.getTime();
    if (newLap >= stopMillis) {
      return; // Prevent unnecessary renders
    }
    setLap(newLap);

    const intervalId = setInterval(() => {
      const newLap = new Date().getTime() - clock.startTimestamp!.getTime();
      if (newLap + clock.elapsed >= stopMillis) {
        clearInterval(intervalId);
      }
      setLap(newLap);
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [clock, updateInterval, stopMillis]);

  return lap + clock.elapsed;
}
