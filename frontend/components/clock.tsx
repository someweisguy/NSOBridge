import { useEffect, useState } from "react";
import defaultTimeStringFormatter from "../utils/time-string-formatters";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

export interface ClockProps {
  startTimestamp: Date | null;
  stopTimestamp?: Date | null;
  elapsed?: number;
  alarm?: number;
  serverOffset?: number;
  freeze?: boolean;
  formatter?: (milliseconds: number, alarm?: number) => string;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  serverOffset = 0, // TODO: don't set default value
  freeze = false,
  formatter = defaultTimeStringFormatter,
}: ClockProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState(new Date());

  useEffect(() => {
    if (freeze || startTimestamp == null) {
      return; // Clock is stopped or manually frozen
    }

    const intervalId = setInterval(
      () => setCurrentTimestamp(new Date()),
      CLOCK_REFRESH_RATE,
    );
    return () => clearInterval(intervalId);
  }, [startTimestamp, freeze]);

  // Calculate the number of milliseconds that have elapsed since the last update
  let milliseconds = elapsed + serverOffset;
  if (startTimestamp != null && stopTimestamp == null) {
    // Clock is running
    milliseconds += currentTimestamp.getTime() - startTimestamp.getTime();
  } else if (startTimestamp != null && stopTimestamp != null) {
    // Clock is stopped but add the additional elapsed time to the accumulator
    milliseconds += stopTimestamp.getTime() - startTimestamp.getTime();
  }

  return <span className="tabular-nums">{formatter(milliseconds, alarm)}</span>;
}
