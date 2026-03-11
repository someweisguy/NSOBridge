import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export class Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;

  static generateKey(boutUuid: string): CacheKey {
    return ["ruleset", boutUuid];
  }
}

export async function getRuleset(boutUuid: string): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset", {
    query: { boutUuid },
  });
}
