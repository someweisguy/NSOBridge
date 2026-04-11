import { CacheKey, JamUri, TimeoutUri } from "./query";
import { Clock } from "./timeout";

/**
 * A type containing the various state values in which a Bout could be.
 */
export type BoutStateString =
  | "final"
  | "jam"
  | "lineup"
  | "stopped"
  | "timeout";

/**
 * Represents a roller derby Bout - the game unit within this app.
 */
export class Bout {
  /**
   * A unique identifier used with this Bout.
   */
  uuid: string;
  /**
   * The unique identifier of the Series with which this Bout is associated.
   */
  seriesUuid: string;
  /**
   * The unique name of the Ruleset that this Bout uses.
   */
  rulesetName: string;
  /**
   * The timestamp at which the next Period will begin or null if no such timestamp has
   * been set. This value is used to set the "time-to-derby" count-down during pregame
   * and halftime.
   */
  startCountdown: Date | null;
  /**
   * The Period clock. Keeps track of the amount of time that has elapsed in the current
   * half.
   */
  clock: Clock;
  /**
   * The current state of the Bout.  // TODO: more documentation required here.
   */
  state: BoutStateString;
  /**
   * True if this Bout is currently running. A Bout is considered to be running when it
   * is not in pregame, halftime, or final. It is possible for a Bout to be running even
   * when the Period clock is stopped.
   */
  isRunning: boolean;
  /**
   * True if this Bout has been finalized. In this situation, a winner (or a tie) has
   * been declared.
   */
  isFinal: boolean;
  /**
   * An array of the Teams competing in this Bout. At least two Teams are required.
   */
  teams: Team[];
  /**
   * The number of Jams in this Bout, per Period. The "third Period" value is used to
   * track the number of overtime Jams and is used to determine if this Bout is in
   * overtime. It is guaranteed that there will always be at least one Jam in a Bout,
   * even if it hasn't started.
   */
  jamCounts: [number, number, number];
  /**
   * The number of Timeouts that have been called in this Bout.
   */
  timeoutCount: number;

  /**
   * Generate a cache key for the desired Bout.
   *
   * @param boutUuid the UUID of the desired Bout.
   * @returns a cache key for the desired Bout.
   */
  static generateKey(boutUuid?: string): CacheKey {
    if (boutUuid == undefined) {
      return ["bouts"];
    }
    return ["bouts", boutUuid];
  }

  /**
   * Get a URI which identifies the latest Jam in this Bout. The latest Jam is the first
   * Jam that has not started.
   *
   * @returns a URI to the latest Jam.
   */
  getLatestJamUri(): JamUri {
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      // Get the latest Period number that contains Jams
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }
    const jamNum = this.jamCounts[periodNum] - 1;

    return { boutUuid: this.uuid, periodNum, jamNum };
  }

  /**
   * Get a URI which identifies the active Jam in this Bout. The active Jam is the last
   * Jam which is running or has ended. If no Jam meets this condition, the latest Jam
   * is returned.
   *
   * @returns a URI to the active Jam.
   */
  getActiveJamUri(): JamUri {
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      // Get the latest Period number that contains Jams
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }
    if (this.jamCounts[periodNum] < 2) {
      return this.getLatestJamUri(); // There is no active Jam
    }
    const jamNum = this.jamCounts[periodNum] - 2;

    return { boutUuid: this.uuid, periodNum, jamNum };
  }

  /**
   * Get a URI which identifies the latest Timeout. The latest Timeout is the timeout
   * which was most recently called. If no Timeouts have been called, the timeoutNum
   * parameter is -1.
   *
   * @returns a URI to the latest Timeout.
   */
  getLatestTimeoutUri(): TimeoutUri {
    return { boutUuid: this.uuid, timeoutNum: this.timeoutCount - 1 };
  }

  /**
   * Return true if this Bout is in overtime.
   *
   * @returns true if this Bout is in overtime.
   */
  isOvertime(): boolean {
    return this.jamCounts[2] > 0;
  }
}

/**
 * An object representing a roller derby Team.
 */
export interface Team {
  /**
   * A unique number representing this Team in this Bout.
   */
  num: number;
  /**
   * The name of this Team.
   */
  name: string;
  /**
   * The league associated with this Team.
   */
  league: string;
  /**
   * An abbreviation for this Team name.
   */
  mnemonic: string;
  /**
   * The total score of this Team.
   */
  boutScore: number;
  /**
   * The number of points which were contributed to this Team's total score in the
   * previous Bout.
   */
  jamScore: number;
  /**
   * The number of Timeouts that this Team may call.
   */
  timeoutsRemaining: number;
  /**
   * The number of Official Reviews that this Team may call.
   */
  reviewsRemaining: number;
  /**
   * The score offset which to add to this Team's Bout score. This value is allowed in
   * the WFTDA 2026 stats paperwork but is used extremely rarely.
   */
  scoreOffset: number;
  /**
   * // TODO: The skaters on this team.
   */
  skaters: unknown[];
}
