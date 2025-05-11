import { Clock } from "@/lib/client/api/bout";
import { useEffect, useRef, useState } from "react";

export default function useAlarmEffect(
  effect: () => void,
  [clock, milliseconds]: [Clock, number]
): void {
  const [alarmHasFired, setAlarmHasFired] = useState<boolean>(false);
  const lastClock = useRef<Clock>(clock);

  // Reset the alarm if the alarm value changes
  useEffect(() => {
    setAlarmHasFired(false);
  }, [milliseconds]);

  // Reset the alarm if the clock is reset
  useEffect(() => {
    if (clock.elapsed < lastClock.current.elapsed) {
      setAlarmHasFired(false);
    }
    lastClock.current = clock;
  }, [clock]);

  useEffect(() => {
    if (alarmHasFired || clock.startTimestamp === null) {
      return;
    }

    const lap = new Date().getTime() - clock.startTimestamp.getTime();
    const timeoutMillis = milliseconds - (clock.elapsed + lap);
    if (timeoutMillis <= 0) {
      // Don't use a Timeout to avoid firing the alarm multiple times
      effect();
      setAlarmHasFired(true);
      return;
    }
    const timeoutId = setTimeout(() => {
      effect();
      setAlarmHasFired(true);
    }, timeoutMillis);

    return () => clearTimeout(timeoutId);
  }, [clock, alarmHasFired, milliseconds, effect]);
}
