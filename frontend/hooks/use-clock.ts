import { useEffect, useState } from "react";

const computeMilliseconds = (
  startTimestamp: string,
  stopTimestamp: string | undefined,
  elapsed = 0,
  alarm: number | null = null,
) => {
  let milliseconds = elapsed;
  if (startTimestamp != null) {
    const stopMilliseconds =
      stopTimestamp == null
        ? new Date().getTime()
        : new Date(stopTimestamp).getTime();
    milliseconds += stopMilliseconds - new Date(startTimestamp).getTime();
  }
  if (alarm) {
    // Convert to a count-down timer
    milliseconds -= alarm;
  }
  return milliseconds;
};

export interface UseClockProps {
  startTimestamp: string;
  stopTimestamp?: string;
  elapsed?: number;
  alarm?: number;
  serverOffset: number;
  freeze?: boolean;
}

export default function useClock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  freeze = false,
}: UseClockProps) {
  const [milliseconds, setMilliseconds] = useState(
    computeMilliseconds(startTimestamp, stopTimestamp, elapsed, alarm),
  );

  useEffect(() => {
    setMilliseconds(
      computeMilliseconds(startTimestamp, stopTimestamp, elapsed, alarm),
    );
    if (startTimestamp != null && stopTimestamp == null && !freeze) {
      const intervalId = setInterval(() => {
        setMilliseconds(
          computeMilliseconds(startTimestamp, stopTimestamp, elapsed, alarm),
        );
        return () => clearInterval(intervalId);
      }, 16);
    }
  }, [startTimestamp, stopTimestamp, elapsed, alarm, freeze]);

  return milliseconds;
}
