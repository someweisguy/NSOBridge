import { useEffect, useRef, useState } from "react";
import { ClockType } from "../types/ClockType";
import { useSocketState } from "../app/hooks/useConnection";
import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { keyFactory } from "../utils/keyFactory";

export default function useClock(
  boutId: string,
  type: string,
  stopAtZero: boolean = true,
  refreshMillis: number = 1000 / 24
): ClockType {
  const { latency } = useSocketState();
  const { data: clock } = useSuspenseQuery<ClockType>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
  });
  const [elapsed, setElapsed] = useState(clock.elapsed);
  const latencyRef = useRef(latency); // Prevent useEffect from firing again

  useEffect(() => {
    if (!clock.isRunning) {
      return;
    }

    let startTime: number = performance.now() - latencyRef.current;
    const intervalId = setInterval(() => {
      const stopTime: number = performance.now();
      const additionalElapsed: number = Math.round(stopTime - startTime);
      setElapsed((elapsed) => elapsed + additionalElapsed);
      startTime = stopTime;

      if (stopAtZero && clock.alarm != null && clock.elapsed >= clock.alarm) {
        clearInterval(intervalId);
      }
    }, refreshMillis);
    return () => clearInterval(intervalId);
  }, [clock, stopAtZero, refreshMillis]);

  return { ...clock, elapsed };
}
