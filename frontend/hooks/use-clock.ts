import { useEffect, useState } from "react";

const CLOCK_REFRESH_RATE = 1000 / 60; // 60Hz refresh rate

const computeMilliseconds = (
  startTimestamp: string,
  stopTimestamp: string | undefined,
  elapsed = 0,
  serverOffset: number,
  alarm: number | null = null,
) => {
  let milliseconds = elapsed;
  const startMilliseconds = new Date(startTimestamp).getTime();
  if (stopTimestamp == null) {
    milliseconds += new Date().getTime() - startMilliseconds;
    milliseconds -= serverOffset; // Only if clock is running
  } else {
    milliseconds += new Date(stopTimestamp).getTime() - startMilliseconds;
  }
  if (alarm) {
    // Convert to a count-down timer
    milliseconds -= alarm;
  }
  return milliseconds;
};

/**
 * Get the number of milliseconds in a clock.
 *
 * This hook updates every `refreshRate` milliseconds to display an up-to-date
 * value in your component.
 *
 * @param startTimestamp the timestamp at which the clock started running.
 * @param stopTimestamp the timestamp at which the clock stopped, or null if the
 * clock is running.
 * @param elapsed the amount of milliseconds which have already elapsed. This
 * value is always zero for one-shot timers.
 * @param serverOffset the millisecond offset in timestamps between the client
 * and the server.
 * @param alarm the number of milliseconds until this clock has elapsed. This
 * value is used to make the output value of this hook a countdown timer.
 * @param freeze used to freeze the hook and prevent the parent component from
 * refreshing.
 * @param refreshRate the refresh rate of the hook in milliseconds. Defaults to
 * 1000/60 milliseconds (60Hz).
 * @returns the number of milliseconds to be shown on the clock.
 */
export default function useClock(
  startTimestamp: string,
  stopTimestamp?: string,
  elapsed = 0,
  serverOffset = 0,
  alarm?: number,
  freeze = false,
  refreshRate = CLOCK_REFRESH_RATE,
) {
  useEffect(() => {
    if (startTimestamp != null && isNaN(new Date(startTimestamp).getTime())) {
      throw new Error("startTimestamp is not a value Date string.");
    }
    if (stopTimestamp != null && isNaN(new Date(stopTimestamp).getTime())) {
      throw new Error("stopTimestamp is not a value Date string.");
    }
  }, [startTimestamp, stopTimestamp]);

  // Compute the clock value when the hook is called
  const [milliseconds, setMilliseconds] = useState(
    computeMilliseconds(
      startTimestamp,
      stopTimestamp,
      elapsed,
      serverOffset,
      alarm,
    ),
  );

  useEffect(() => {
    // Compute the clock value when the props are refreshed
    setMilliseconds(
      computeMilliseconds(
        startTimestamp,
        stopTimestamp,
        elapsed,
        serverOffset,
        alarm,
      ),
    );

    if (startTimestamp != null && stopTimestamp == null && !freeze) {
      // Compute the clock value every `refreshRate` milliseconds
      const intervalId = setInterval(() => {
        setMilliseconds(
          computeMilliseconds(
            startTimestamp,
            stopTimestamp,
            elapsed,
            serverOffset,
            alarm,
          ),
        );
        return () => clearInterval(intervalId);
      }, refreshRate);
    }
  }, [
    startTimestamp,
    stopTimestamp,
    elapsed,
    serverOffset,
    alarm,
    freeze,
    refreshRate,
  ]);

  return milliseconds;
}
