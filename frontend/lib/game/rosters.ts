import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";

export default async function getRoster(rosterId: number): Promise<Roster> {
  return await localAPI.get("roster", { query: { rosterId } });
}

export class Roster {
  id: number;
  name: string;

  static generateKey(rosterId: number): CacheKey {
    return ["rosters", [rosterId], {}];
  }
}
