import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ClockType } from "../types/ClockType";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/keyFactory";
import dispatch from "../app/client";
import { useSocketState } from "../app/hooks/useConnection";
import { BoutIdType } from "../types/bout";

export default function useAlarmEffect(
  callback: () => void,
  [boutId, type, milliseconds = 0]: [BoutIdType, string, number?]
): Dispatch<SetStateAction<boolean>> {
  const [alarmHasFired, setAlarmHasFired] = useState<boolean>(false);
  const { latency } = useSocketState();
  const { data: clock, dataUpdatedAt: clockUpdatedAt } =
    useSuspenseQuery<ClockType>({
      queryKey: keyFactory.clock(boutId, type),
      queryFn: () => dispatch("clock", "get", { boutId, type }),
    });
  const lastClockElapsedRef = useRef<number>(clock.elapsed);
  const latencyRef = useRef<number>(latency);

  useEffect(() => {
    latencyRef.current = latency;
  }, [latency]);

  // Restart the alarm if any hook parameters change
  useEffect(() => {
    setAlarmHasFired(false);
  }, [boutId, type, callback, milliseconds]);

  // Restart the alarm if the clock has been reset
  useEffect(() => {
    if (clock.elapsed < lastClockElapsedRef.current) {
      setAlarmHasFired(false);
    }
    lastClockElapsedRef.current = clock.elapsed;
  }, [clock]);

  useEffect(() => {
    if (alarmHasFired) {
      return;
    }

    // Determine how much time has elapsed on the clock
    const elapsedSinceLastData: number = Date.now() - clockUpdatedAt;
    let clockElapsed: number = clock.elapsed;
    if (clock.isRunning) {
      clockElapsed += elapsedSinceLastData + latencyRef.current;
    }

    // Check if the callback should be fired immediately
    const clockRemaining: number = clock.alarm! - clockElapsed;
    if (clockRemaining <= milliseconds) {
      setAlarmHasFired(true);
      callback();
    }

    // Don't set a timeout if the clock is stopped
    if (!clock.isRunning) {
      return;
    }

    // Set a timeout to call the callback when the alarm goes off
    const timeoutId = setTimeout(() => {
      setAlarmHasFired(true);
      callback();
    }, clockRemaining - milliseconds);
    return () => clearTimeout(timeoutId);
  }, [clock, clockUpdatedAt, alarmHasFired, milliseconds, callback]);

  return setAlarmHasFired;
}
