import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

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

export class Series {
  uuid: string;
  name: string;
  boutUuids: string[];
  activeBoutIndex: number | null;

  static generateKey(uuid?: string): CacheKey {
    const key: CacheKey = ["series"];
    if (uuid != undefined) {
      key.push(uuid);
    }
    return key;
  }
}
