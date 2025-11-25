import { Series } from "@/shared/types/series";
import { localAPI } from "../requests";

export async function getSeries(seriesIndex: number): Promise<Series> {
  const data = await localAPI.get("series", { query: { seriesIndex } });
  return Object.assign(new Series(), data);
}
