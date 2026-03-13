import { CacheKey } from "@/types/query";
import { localAPI } from "../requests";

/**
 * Represent an event with multiple Bouts. A Series is simply a collection of multiple
 * Bouts. This grouping can be used to track per-event statistics, such as the number
 * of team wins/losses during a tournament Series.
 */
export class Series {
  /**
   * The unique identifier of this Series.
   */
  uuid: string;
  /**
   * The name of the Series.
   */
  name: string;
  /**
   * The UUIDs of the Bouts associated with this Series.
   */
  boutUuids: string[];
  /**
   * The index of the active Bout in this Series or null if no Bout is active.
   */
  activeBoutIndex: number | null;

  /**
   * Generate a cache key for the desired Series.
   *
   * @param seriesUuid the UUID of the Series.
   * @returns a cache key for the desired Series.
   */
  static generateKey(seriesUuid?: string): CacheKey {
    const key: CacheKey = ["series"];
    if (seriesUuid != undefined) {
      key.push(seriesUuid);
    }
    return key;
  }
}

/**
 * Get all Series on the server.
 *
 * @returns an array of all Series.
 */
export async function getAllSeries(): Promise<Series[]> {
  const data = await localAPI.get<Partial<Series>[]>("series/allSeries");
  return data.map((series: Partial<Series>) =>
    Object.assign(new Series(), series),
  );
}

/**
 * Get a Series from the server
 *
 * @param seriesUuid the UUID of the desired Series.
 * @returns the desired Series.
 */
export async function getSeries(seriesUuid: string): Promise<Series> {
  const data = await localAPI.get<Partial<Series>>("series", {
    query: { seriesUuid },
  });
  return Object.assign(new Series(), data);
}
