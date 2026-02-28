import { useEffect, useState } from "react";
import defaultTimeStringFormatter from "../utils/time-string-formatters";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

const timeFormatters = {
  bout: defaultTimeStringFormatter,
  jam: defaultTimeStringFormatter,
  lineup: defaultTimeStringFormatter,
  timeout: defaultTimeStringFormatter,
  countUp: defaultTimeStringFormatter,
};

export interface ClockProps {
  /**
   * The timestamp at which this Clock was started or `null` if it isn't running.
   */
  startTimestamp: Date | null;
  /**
   * The timestamp at which this Clock was stopped or `null` if it is running.
   */
  stopTimestamp?: Date | null;
  /**
   * The number of milliseconds that have elapsed on this clock already.
   */
  elapsed?: number;
  /**
   * The number of milliseconds on this Clock's alarm. Setting this parameter to a
   * number turns this Clock into a count-down.
   */
  alarm?: number;
  /**
   * The difference in milliseconds between the host and the server. Allows for visual
   * synchronization between multiple clients.
   */
  serverOffset?: number;
  /**
   * True to freeze the clock at it current time.
   */
  freeze?: boolean;
  /**
   * The format to use when formatting this Clock.
   */
  formatter?: keyof typeof timeFormatters;
}

export default function Clock({
  startTimestamp,
  stopTimestamp,
  elapsed = 0,
  alarm,
  serverOffset = 0, // TODO: don't set default value
  freeze = false,
  formatter = "countUp",
}: ClockProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState(new Date());

  useEffect(() => {
    if (freeze || startTimestamp == null) {
      return; // Clock is stopped or manually frozen
    }

    setCurrentTimestamp(new Date());
    const intervalId = setInterval(
      () => setCurrentTimestamp(new Date()),
      CLOCK_REFRESH_RATE,
    );
    return () => clearInterval(intervalId);
  }, [startTimestamp, freeze]);

  // Calculate the number of milliseconds that have elapsed since the last update
  let milliseconds = elapsed;
  if (startTimestamp != null && stopTimestamp == null) {
    // Clock is running
    milliseconds += currentTimestamp.getTime() - startTimestamp.getTime();
  } else if (startTimestamp != null && stopTimestamp != null) {
    // Clock is stopped but add the additional elapsed time to the accumulator
    milliseconds += stopTimestamp.getTime() - startTimestamp.getTime();
  }

  if (startTimestamp != null) {
    milliseconds += serverOffset;
  }

  return (
    <span className="tabular-nums">
      {timeFormatters[formatter](milliseconds, alarm)}
    </span>
  );
}
