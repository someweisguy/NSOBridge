import { localAPI } from "../requests";

export default async function getRoster(id: number): Promise<Roster> {
  return await localAPI.get("roster", { query: { id } });
}

export class Roster {
  id: number;
  name: string;

  static generateKey(rosterId: number) {
    return ["rosters", rosterId];
  }
}
