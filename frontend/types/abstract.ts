export interface OneShot {
  /**
   * The timestamp at which this OneShot was started.
   */
  startTimestamp: string | null;
  /**
   * The timestamp at which this OneShot was stopped.
   */
  stopTimestamp: string | null;
}

export interface Timer {
  /**
   * The timestamp at which this Timer was most recently started.
   */
  startTimestamp: string | null;
  /**
   * The amount of time that has already elapsed on this Timer.
   */
  elapsed: number;
}

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
