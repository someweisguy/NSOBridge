import { CacheKey } from "@/types/query";
import { localAPI } from "../requests";

/**
 * An object that contains various configuration values that determine how the Bout is
 * played. This is used to support multiple styles of Roller Derby play without
 * adjusting the codebase in a major way. Each Bout may only support one Ruleset.
 */
export class Ruleset {
  /**
   * The duration of the Jam in milliseconds.
   */
  jamDuration: number;
  /**
   * The duration of the Lineup in milliseconds.
   */
  lineupDuration: number;
  /**
   * The maximum number of points that a Jammer may earn per trip through the pack.
   */
  pointsPerTrip: number;
  /**
   * The number of Timeouts that each Team may have at any given time.
   */
  numTimeouts: number;
  /**
   * The number of Official Reviews that each Team may have at any given time.
   */
  numReviews: number;

  /**
   * Generate a cache key for the desired Ruleset.
   *
   * @param boutUuid the UUID of the Bout associated with the desired Ruleset.
   * @returns a cache key for the desired Ruleset.
   */
  static generateKey(boutUuid: string): CacheKey {
    return ["ruleset", boutUuid];
  }
}

/**
 * Get the roller derby ruleset associated with the desired Bout.
 *
 * @param boutUuid the UUID of the Bout whose Ruleset should be fetched.
 * @returns a Ruleset associated with the desired Bout.
 */
export async function getRuleset(boutUuid: string): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset", {
    query: { boutUuid },
  });
}
