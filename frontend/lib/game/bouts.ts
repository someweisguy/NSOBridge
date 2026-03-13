import { localAPI } from "@/lib/requests";
import { JamUri, TimeoutUri } from "@/types/query";
import { CacheKey } from "@/types/ws";
import { Clock } from "./timeouts";

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
  uuid: string;
  seriesUuid: string;
  rulesetName: string;

  startCountdown: Date | null;
  clock: Clock;

  state: BoutStateString;
  isRunning: boolean;
  isFinal: boolean;
  teams: Team[];
  jamCounts: [number, number, number];
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
  num: number;

  name: string;
  league: string;
  mnemonic: string;

  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}

/**
 * Get a Bout object from the server.
 *
 * @param boutUuid the UUID of the desired bout.
 * @returns the desired Bout.
 */
export async function getBout(boutUuid: string): Promise<Bout> {
  const data = await localAPI.get<Partial<Bout>>("bout", {
    query: { boutUuid },
  });
  return Object.assign(new Bout(), data);
}

/**
 * Get all Bout objects from the server.
 *
 * @returns an array of all Bouts in the server.
 */
export async function getAllBouts(): Promise<Bout[]> {
  const data = await localAPI.get<Partial<Bout>[]>("bout/allBouts");
  return data.map((bout: Partial<Bout>) => Object.assign(new Bout(), bout));
}

/**
 * Create a new Bout.
 *
 * // TODO: this function has not been tested and does not work
 *
 * @param rosterIds
 * @param seriesIndex
 * @param order
 */
export async function createBout(
  rosterIds: number[],
  seriesIndex = 1,
  order = 0,
): Promise<void> {
  await localAPI.post("bout/wftda2025", {
    query: { seriesIndex },
    body: { rosterIds, order },
  });
}

/**
 * Begin the Period of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function beginPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/beginPeriod", { query: { boutUuid } });
}

/**
 * End the Period of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function endPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/endPeriod", { query: { boutUuid } });
}

/**
 * Start the latest Jam of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function startJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startJam", { query: { boutUuid } });
}

/**
 * Stop the active Jam of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function stopJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopJam", { query: { boutUuid } });
}

/**
 * Create and start a new Timeout in the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function startTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startTimeout", {
    query: { boutUuid },
  });
}

/**
 * Stop the latest Timeout in the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function stopTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopTimeout", {
    query: { boutUuid },
  });
}
