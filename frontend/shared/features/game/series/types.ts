import genericRequest from "@/shared/lib/requests";
import { Bout } from "../bouts/types";

export interface Series {
  readonly id: number;
  readonly name: string;
  readonly bouts: Bout[];
}

export async function getSeries(seriesIndex: number): Promise<Series> {
  return await genericRequest("series", "GET", {
    seriesIndex,
  });
}
