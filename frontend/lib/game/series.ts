import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export async function getSeries(seriesUuid: string): Promise<Series[]> {
  const data = await localAPI.get<Partial<Series>[]>("series", {
    query: { seriesUuid },
  });
  return data.map((series: Partial<Series>) =>
    Object.assign(new Series(), series),
  );
}

export class Series {
  uuid: string;
  name: string;
  boutUuids: string[];
  activeBoutIndex: number | null;

  static generateKey(uuid: string): CacheKey {
    return ["series", uuid];
  }
}
