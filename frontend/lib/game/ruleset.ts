import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export async function getRuleset(boutId: number): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset", {
    query: { boutId },
  });
}

export class Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;

  static generateKey(rulesetName: string): CacheKey {
    return ["ruleset", [rulesetName], {}];
  }
}
