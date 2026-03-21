import { Series } from "@/types/series";
import { localAPI } from "../requests";

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
