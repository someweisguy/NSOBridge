import { useEffect, useRef, useState } from "react";
import { ClockType } from "../../../types/ClockType";
import { useSocketState } from "../../../app/hooks/useConnection";
import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../../../app/client";
import { keyFactory } from "../../../utils/keyFactory";

export default function useDynamicClock(
  boutId: string,
  type: string,
  stopAtZero: boolean = true,
  refreshMillis: number = 1000 / 24  // 24 FPS
): ClockType {
  const { latency } = useSocketState();
  const { data: clock, dataUpdatedAt: clockUpdatedAt } =
    useSuspenseQuery<ClockType>({
      queryKey: keyFactory.clock(boutId, type),
      queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
    });
  const [elapsed, setElapsed] = useState(clock.elapsed);
  const latencyRef = useRef(latency); // Prevent useEffect from firing again

  useEffect(() => {
    latencyRef.current = latency;
  }, [latency]);

  useEffect(() => {
    // Determine how much time has elapsed on the clock
    const elapsedSinceLastData: number = Date.now() - clockUpdatedAt;
    let clockElapsed: number = clock.elapsed;
    if (clock.isRunning) {
      clockElapsed += elapsedSinceLastData + latencyRef.current;
    }
    setElapsed(clockElapsed);

    // Do not set an interval if the clock is stopped
    if (!clock.isRunning) {
      return;
    }

    // Update the elapsed time every refreshMillis
    let startTime: number = performance.now() - latencyRef.current;
    const intervalId = setInterval(() => {
      const stopTime: number = performance.now();
      const additionalElapsed: number = Math.round(stopTime - startTime);
      if (stopAtZero && clock.alarm != null && clock.elapsed >= clock.alarm) {
        clearInterval(intervalId);
        setElapsed(clock.alarm);
      } else {
        setElapsed((elapsed) => elapsed + additionalElapsed);
        startTime = stopTime;
      }
    }, refreshMillis);
    return () => clearInterval(intervalId);
  }, [clock, clockUpdatedAt, stopAtZero, refreshMillis]);

  return { ...clock, elapsed };
}
