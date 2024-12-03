import { useEffect, useRef, useState } from "react";
import { useConnection, useGetter } from "../app/client";
import { ClockType } from "../types/ClockType";


export default function useClock(boutId: string, type: string,
  refreshMillis: number = 1000 / 24): ClockType {
  const { latency } = useConnection();
  const clock: ClockType = useGetter<ClockType>("clock",
    { boutId, type }, { latency }
  );
  const [elapsed, setElapsed] = useState(clock.elapsed);
  const latencyRef = useRef(latency);  // Prevent useEffect from firing again

  useEffect(() => {
    if (!clock.isRunning) {
      return;
    }

    let startTime: number = performance.now() - latencyRef.current;
    const intervalId = setInterval(() => {
      const stopTime: number = performance.now()
      const additionalElapsed: number = Math.round(stopTime - startTime);
      setElapsed(elapsed => elapsed + additionalElapsed);
      startTime = stopTime;
    }, refreshMillis);
    return () => clearInterval(intervalId);
  }, [clock, refreshMillis]);

  return { ...clock, elapsed }
}