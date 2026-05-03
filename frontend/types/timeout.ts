import { OneShot, Timer } from "./abstract";
import { CacheKey } from "./query";

/**
 * Represent a Clock in Roller Derby. A clock may be started and stopped multiple times
 * whereas a one-shot (such as a Jam or Timeout) can only be started and stopped once.
 */
export class Clock implements Timer {
  startTimestamp: string | null;
  elapsed: number;
  /**
   * The number of milliseconds that must elapse for the alarm on this Clock to trigger.
   */
  alarm: number;

  // constructor({
  //   startTimestamp,
  //   elapsed,
  //   alarm,
  // }: {
  //   startTimestamp: string | null;
  //   elapsed: number;
  //   alarm: number;
  // }) {
  //   this.startTimestamp =
  //     startTimestamp == null ? null : new Date(startTimestamp);
  //   this.elapsed = elapsed;
  //   this.alarm = alarm;
  // }

  // /**
  //  * Determine if this Clock is running.
  //  *
  //  * @returns true if this Clock is running.
  //  */
  // isRunning(): boolean {
  //   return this.startTimestamp !== null;
  // }
}

/**
 * Represent a Timeout or Official Review within a Bout. A Timeout is called to stop the
 * flow of the game. This may be done by any Team with a sufficient number of Timeouts
 * remaining or by the officials for any reason.
 */
export class Timeout implements OneShot {
  /**
   * The UUID of the Bout associated with this Timeout.
   */
  boutUuid: string;
  /**
   * The unique number identifying this Timeout within its Bout.
   */
  num: number;
  /**
   * The Period number in which this Timeout was called.
   */
  periodNum: number;
  /**
   * The Jam number in which this Timeout was called. The Jam number of a Timeout is
   * always the Jam number of the Jam that has just ended.
   */
  jamNum: number;
  startTimestamp: string | null;
  stopTimestamp: string | null;
  /**
   * The amount of milliseconds that have elapsed on the Period clock when this Timeout
   * was called.
   */
  clockElapsed: number;
  /**
   * The Team number of the Team which called this timeout or null if the calling team
   * has not yet been determined.
   */
  teamNum: number | null;
  /**
   * True if this Timeout was called by the officials.
   */
  teamIsOfficials: boolean;
  /**
   * True if this Timeout is an Official Review.
   */
  isReview: boolean;
  /**
   * Any important details or context about this Timeout. This value is typically used
   * only for Official Reviews.
   */
  details: string;
  /**
   * The result of this Timeout. This value is typically used only for Official Reviews.
   */
  result: string;
  /**
   * True if this Timeout was retained. This value is typically used only for Official
   * Reviews.
   */
  retained: boolean;

  /**
   * Generate a cache key for the desired Timeout.
   *
   * @param boutUuid the UUID of the Bout associated with the desired Timeout.
   * @param timeoutNum the number of the desired Timeout.
   * @returns a cache key for the desired Timeout.
   */
  static generateKey(boutUuid: string, timeoutNum: number): CacheKey {
    return ["timeouts", boutUuid, timeoutNum];
  }

  // /**
  //  * Determine if this Timeout has been started.
  //  *
  //  * @returns true if this Timeout has started.
  //  */
  // hasStarted(): boolean {
  //   return this.startTimestamp != null;
  // }

  // /**
  //  * Determine if this Timeout is currently running.
  //  *
  //  * @returns true if this Timeout is currently running.
  //  */
  // isRunning(): boolean {
  //   return this.hasStarted() && this.stopTimestamp == null;
  // }
}
