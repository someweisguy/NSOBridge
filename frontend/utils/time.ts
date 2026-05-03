import { OneShot, Timer } from "@/types/time";

export const isStarted = (obj: OneShot | Timer): boolean => {
  return obj.startTimestamp != null;
};

// TODO: Move this method
export const isRunning = (obj: OneShot | Timer): boolean => {
  return (
    obj.startTimestamp != null &&
    (!("stopTimestamp" in obj) || obj.stopTimestamp == null)
  );
};

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
