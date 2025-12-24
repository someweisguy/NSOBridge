import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";

export default async function getRoster(rosterId: number): Promise<Roster> {
  const data = await localAPI.get<Partial<Roster>>("roster", {
    query: { rosterId },
  });
  return Object.assign(new Roster(), data);
}

export class Roster {
  id: number;
  name: string;

  static generateKey(rosterId: number): CacheKey {
    return ["rosters", [rosterId], {}];
  }
}
