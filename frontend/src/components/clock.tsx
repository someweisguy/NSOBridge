import { useSocketState } from "@/app/hooks/useConnection";
import { useEffect, useState } from "react";

export default function Clock({
  alarm,
  elapsed,
  isRunning,
  showMillis = "auto",
  stopAtZero = true,
}: {
  alarm: number | null;
  elapsed: number;
  isRunning: boolean;
  showMillis?: "never" | "always" | "auto";
  stopAtZero?: boolean;
}) {
  const { latency } = useSocketState();
  const [actualElapsed, setActualElapsed] = useState<number>(elapsed);

  useEffect(() => {
    if (!isRunning) {
      setActualElapsed(elapsed);
      return;
    }

    // Get the time that the clock started running
    const runningSince: number = performance.now() - latency;

    // Call a recursive timeout function which updates the clock every 100ms
    let timeoutId: NodeJS.Timeout;
    const timeoutFunction: () => void = () => {
      const newActualElapsed = performance.now() - runningSince + elapsed;
      setActualElapsed(newActualElapsed);
      if (alarm != null &&  newActualElapsed >= alarm && stopAtZero) {
        return;
      }
      timeoutId = setTimeout(
        timeoutFunction,
        100 - (Math.round(elapsed + newActualElapsed) % 100)
      );
    };
    timeoutId = setTimeout(timeoutFunction, 100 - (elapsed % 100));

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isRunning, elapsed, stopAtZero, alarm]);


  // Calculate the display milliseconds, rounding based on millisStyle
  let displayMillis = alarm == null ? actualElapsed : alarm - actualElapsed;
  if (displayMillis < 0 && stopAtZero) {
    displayMillis = 0;
  } else if (
    showMillis === "never" ||
    (showMillis === "auto" && displayMillis >= 10000)
  ) {
    displayMillis -= displayMillis % 1000;
  } else {
    displayMillis -= displayMillis % 100;
  }

  return <>{displayMillis}</>;
}
