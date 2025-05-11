import { Bout, Clock } from "@/lib/client/api/bout";
import { useEffect, useRef, useState } from "react";
import useBout from "./use-bout";

export default function useAlarmEffect(
  effect: () => void,
  [boutId, clockName, milliseconds]: [
    string,
    keyof Bout["timer"]["clocks"],
    number
  ]
): void {
  const [alarmHasFired, setAlarmHasFired] = useState<boolean>(false);
  const clock: Clock = useBout(boutId).timer.clocks[clockName];
  const lastClock = useRef<Clock>(clock);

  // Reset the alarm if any of the props change
  useEffect(() => {
    setAlarmHasFired(false);
  }, [boutId, clockName, milliseconds]);

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
