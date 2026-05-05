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

/**
 * Represent a Clock in Roller Derby. A clock may be started and stopped multiple times
 * whereas a one-shot (such as a Jam or Timeout) can only be started and stopped once.
 */
export interface Clock extends Timer {
  /**
   * The number of milliseconds that must elapse for the alarm on this Clock to trigger.
   */
  alarm: number;
}
