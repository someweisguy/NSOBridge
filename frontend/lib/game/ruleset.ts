import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export async function getRuleset(boutUuid: string): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset", {
    query: { boutUuid },
  });
}

export class Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;

  static generateKey(rulesetName: string): CacheKey {
    return ["ruleset", rulesetName];
  }
}
