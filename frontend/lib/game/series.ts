import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export async function getSeries(): Promise<Series[]> {
  const data = await localAPI.get<Partial<Series>[]>("series");
  return data.map((series: Partial<Series>) =>
    Object.assign(new Series(), series),
  );
}

export class Series {
  id: number;
  name: string;
  boutIds: number[];
  activeBoutId: number | null;

  static generateKey(): CacheKey {
    return ["series", [], {}];
  }
}
