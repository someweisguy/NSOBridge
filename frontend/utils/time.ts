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
