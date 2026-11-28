import { Clock, OneShot } from "@/types/time";
import { computeMilliseconds } from "@/utils/time";
import { useEffect, useState } from "react";

// The default refresh rates for the useClock hook (60Hz)
const CLOCK_REFRESH_RATE = 1000 / 60;

export interface UseClockOptions {
  /**
   * The difference in time (in milliseconds) between the client's time-of-day
   * clock and the host's time-of-day clock.
   */
  serverOffset?: number;
  /**
   * True to freeze the output of the hook to prevent the parent component from
   * refreshing.
   */
  freeze?: boolean;
  /**
   * The amount of time in milliseconds to wait before refreshing the output
   * value.
   */
  refreshRate?: number;
}

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
  {
    startTimestamp,
    stopTimestamp,
    elapsed = 0,
    alarm = 0,
  }: OneShot & Partial<Clock>,
  { serverOffset, freeze, refreshRate }: UseClockOptions = {
    serverOffset: 0,
    freeze: false,
    refreshRate: CLOCK_REFRESH_RATE,
  },
) {
  // Compute the clock value when the hook is called
  const [milliseconds, setMilliseconds] = useState(
    computeMilliseconds(
      startTimestamp,
      stopTimestamp,
      elapsed,
      alarm,
      serverOffset,
    ),
  );

  useEffect(() => {
    if (freeze) {
      // Never update state if the hook is frozen
      return;
    }

    // Compute the clock value when the props are refreshed
    setMilliseconds(
      computeMilliseconds(
        startTimestamp,
        stopTimestamp,
        elapsed,
        alarm,
        serverOffset,
      ),
    );

    if (
      (startTimestamp == null || stopTimestamp == null) &&
      !(startTimestamp == null && stopTimestamp == null)
    ) {
      // Compute the clock value every `refreshRate` milliseconds
      const intervalId = setInterval(() => {
        setMilliseconds(
          computeMilliseconds(
            startTimestamp,
            stopTimestamp,
            elapsed,
            alarm,
            serverOffset,
          ),
        );
      }, refreshRate);
      return () => clearInterval(intervalId);
    }
  }, [
    startTimestamp,
    stopTimestamp,
    elapsed,
    alarm,
    serverOffset,
    freeze,
    refreshRate,
  ]);

  return milliseconds;
}
