import { useSocketState } from "@/app/hooks/useConnection";
import { useEffect, useState } from "react";

export default function Clock({
  alarm = null,
  elapsed,
  isRunning,
  showMillis = "auto",
  stopAtZero = true,
}: {
  alarm?: number | null;
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
      if (alarm != null && newActualElapsed >= alarm && stopAtZero) {
        // Stop needlessly rerendering the clock when it reaches the alarm
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

  // Calculate the time values that should be displayed on the clock
  let displayTotal: number = Math.round(
    alarm == null ? actualElapsed : alarm - actualElapsed
  );
  const displayIsNegative: boolean = displayTotal < 0;
  if (displayIsNegative) {
    // Prevent the display from showing negative time
    displayTotal = stopAtZero ? 0 : Math.abs(displayTotal);
  }
  const hours: number = Math.floor(displayTotal / 3600000);
  const minutes: number = Math.floor(displayTotal / 60000) % 60;
  const seconds: number = Math.floor(displayTotal / 1000) % 60;

  // Format the display as a string
  let timeString: string = "";
  if (hours) {
    timeString += hours.toString() + ":";
  }
  if (minutes) {
    timeString += minutes.toString().padStart(hours ? 2 : 0, "0") + ":";
  }
  timeString += seconds.toString().padStart(minutes ? 2 : 0, "0");
  if (
    alarm != null &&
    !displayIsNegative &&
    (showMillis === "always" || (showMillis === "auto" && displayTotal < 10000))
  ) {
    // Conditionally add milliseconds to the display
    timeString += "." + Math.floor((displayTotal % 1000) / 100);
  }

  return <>{timeString}</>;
}
