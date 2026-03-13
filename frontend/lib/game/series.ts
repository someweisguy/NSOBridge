import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export class Series {
  uuid: string;
  name: string;
  boutUuids: string[];
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

export async function getAllSeries(): Promise<Series[]> {
  const data = await localAPI.get<Partial<Series>[]>("series/allSeries");
  return data.map((series: Partial<Series>) =>
    Object.assign(new Series(), series),
  );
}

export async function getSeries(seriesUuid: string): Promise<Series> {
  const data = await localAPI.get<Partial<Series>>("series", {
    query: { seriesUuid },
  });
  return Object.assign(new Series(), data);
}
