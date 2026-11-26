import { OneShot, Timer } from "@/types/time";

/**
 * Check if a OneShot or Timer has started.
 *
 * @param obj the OneShot or Timer to check.
 * @returns True if the OneShot or Timer has started.
 */
export const isStarted = (obj: OneShot | Timer): boolean => {
  return obj.startTimestamp != null;
};

/**
 * Check if a OneShot or Timer is running.
 *
 * @param obj the OneShot or Timer to check.
 * @returns True if the OneShot or Timer is running.
 */
export const isRunning = (obj: OneShot | Timer): boolean => {
  return (
    obj.startTimestamp != null &&
    (!("stopTimestamp" in obj) || obj.stopTimestamp == null)
  );
};

/**
 * Get the number of milliseconds that has elapsed on a OneShot or Timer.
 *
 * @param obj the OneShot or Timer to check.
 * @returns the number of milliseconds that has elapsed.
 */
export const getElapsed = (obj: OneShot | Timer): number => {
  let elapsed = 0;

  if (obj.startTimestamp != null) {
    if ("stopTimestamp" in obj && obj.stopTimestamp != null) {
      elapsed =
        new Date(obj.stopTimestamp).getTime() -
        new Date(obj.startTimestamp).getTime();
    } else {
      elapsed = new Date().getTime() - new Date(obj.startTimestamp).getTime();
    }
  }

  if ("elapsed" in obj) {
    elapsed += obj.elapsed;
  }

  return elapsed;
};

/**
 * Compute the number of milliseconds between two timestamps. This is used to
 * determine the amount of time remaining on a clock.
 *
 * @param startTimestamp the start timestamp. Defaults to `new Date()`.
 * @param stopTimestamp the time at which the clock has stopped. Defaults to
 * `new Date()` which indicates that the clock is still running.
 * @param elapsed The number of milliseconds which have already elapsed in this
 * clock. Defaults to `0`.
 * @param alarm an optional number of milliseconds which must elapse before the
 * clock is considered expired. Supplying a non-zero value turns the output into
 * a count-down clock. Defaults to `0`.
 * @param serverOffset The offset (in milliseconds) between the client's
 * time-of-day clock and the host's time-of-day clock. This argument is only
 * applied to the function output when the clock is running.
 *
 * @returns The number of milliseconds to be displayed for this clock.
 */
export const computeMilliseconds = (
  startTimestamp: string | null,
  stopTimestamp: string | null,
  elapsed = 0,
  alarm: number | null = null,
  serverOffset = 0,
) => {
  const nowMillis = new Date().getTime() - serverOffset;
  let milliseconds = elapsed;
  const startMillis =
    startTimestamp == null ? nowMillis : new Date(startTimestamp).getTime();
  if (stopTimestamp == null) {
    milliseconds += nowMillis - startMillis;
  } else {
    milliseconds += new Date(stopTimestamp).getTime() - startMillis;
  }
  if (alarm) {
    // Convert to a count-down timer
    milliseconds = alarm - milliseconds;
  }
  return milliseconds;
};
