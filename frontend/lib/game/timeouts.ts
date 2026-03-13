import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

/**
 * Represent a Clock in Roller Derby. A clock may be started and stopped multiple times
 * whereas a one-shot (such as a Jam or Timeout) can only be started and stopped once.
 */
export class Clock {
  startTimestamp: Date | null;
  elapsed: number;
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
 * Represent a Timeout within a Bout. A Timeout is called to stop the flow of the game.
 * This may be done by any Team with a sufficient number of Timeouts remaining or by the
 * officials for any reason.
 */
export class Timeout {
  boutUuid: string;
  num: number;

  periodNum: number;
  jamNum: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  teamNum: number | null;
  teamIsOfficials: boolean;
  isReview: boolean;
  details: string;
  result: string;
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

export async function getTimeout(
  boutUuid: string,
  num: number
): Promise<Timeout> {
  const data = await localAPI.get<Partial<Timeout>>("timeout", {
    query: { boutUuid, num },
  });
  return Object.assign(new Timeout(), data);
}

export async function setTimeoutType(
  boutUuid: string,
  timeoutNum: number,
  type: "timeout" | "review"
): Promise<void> {
  await localAPI.post("timeout/type", {
    query: { boutUuid, num: timeoutNum },
    body: JSON.stringify(type),
  });
}

export async function setTimeoutTeam(
  boutUuid: string,
  timeoutNum: number,
  teamNum: number | null
): Promise<void> {
  await localAPI.post("timeout/team", {
    query: { boutUuid, num: timeoutNum },
    body: teamNum,
  });
}

export async function setTimeoutRetained(
  boutUuid: string,
  timeoutNum: number,
  isRetained: boolean
): Promise<void> {
  await localAPI.post("timeout/retained", {
    query: { boutUuid, num: timeoutNum },
    body: isRetained,
  });
}
