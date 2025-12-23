import { localAPI } from "@/lib/requests";

export default async function getRoster(rosterId: number): Promise<Roster> {
  return await localAPI.get("roster", { query: { rosterId } });
}

export class Roster {
  id: number;
  name: string;

  static generateKey(rosterId: number) {
    return ["rosters", rosterId];
  }
}
