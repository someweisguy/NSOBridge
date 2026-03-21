import { CacheKey } from "@/types/query";
import { localAPI } from "../requests";

/**
 * Represent a Clock in Roller Derby. A clock may be started and stopped multiple times
 * whereas a one-shot (such as a Jam or Timeout) can only be started and stopped once.
 */
export class Clock {
  /**
   * The timestamp at which this Clock was started or null if it hasn't been started.
   */
  startTimestamp: Date | null;
  /**
   * The number of milliseconds that have already elapsed on this Clock.
   */
  elapsed: number;
  /**
   * The number of milliseconds that must elapse for the alarm on this Clock to trigger.
   */
  alarm: number;

  /**
   * Determine if this Clock is running.
   *
   * @returns true if this Clock is running.
   */
  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

/**
 * Represent a Timeout or Official Review within a Bout. A Timeout is called to stop the
 * flow of the game. This may be done by any Team with a sufficient number of Timeouts
 * remaining or by the officials for any reason.
 */
export class Timeout {
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
  /**
   * The timestamp at which this Timeout was called.
   */
  startTimestamp: Date | null; // TODO: can this be null?
  /**
   * The timestamp at which this Timeout was ended.
   */
  stopTimestamp: Date | null;
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

  /**
   * Determine if this Timeout has been started.
   *
   * @returns true if this Timeout has started.
   */
  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  /**
   * Determine if this Timeout is currently running.
   *
   * @returns true if this Timeout is currently running.
   */
  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
}

/**
 * Set the desired Timeout to the specified timeout type.
 *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param type the timeout type to which to set the desired Timeout.
 */
export async function setTimeoutType(
  boutUuid: string,
  timeoutNum: number,
  type: "timeout" | "review",
): Promise<void> {
  await localAPI.post("timeout/type", {
    query: { boutUuid, num: timeoutNum },
    body: JSON.stringify(type),
  });
}

/**
 * Set the calling Team of the desired Timeout. Setting teamNum to null means that the
 * desired Timeout was called by the officials.
 *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param teamNum
 */
export async function setTimeoutTeam(
  boutUuid: string,
  timeoutNum: number,
  teamNum: number | null,
): Promise<void> {
  await localAPI.post("timeout/team", {
    query: { boutUuid, num: timeoutNum },
    body: teamNum,
  });
}

/**
 * Set whether or not the desired Timeout or Official Review was retained. Typically if
 * a Team calls an Official Review and the call on the track stands, the calling Team
 * will not retain their Official Review.
 *  *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param isRetained true if this Timeout should be retained.
 */
export async function setTimeoutRetained(
  boutUuid: string,
  timeoutNum: number,
  isRetained: boolean,
): Promise<void> {
  await localAPI.post("timeout/retained", {
    query: { boutUuid, num: timeoutNum },
    body: isRetained,
  });
}
