import { Roster } from "@/types/people";
import { localAPI } from "../requests";

export async function getRosters(rosterIds: number[]): Promise<Roster[]> {
  const query = new URLSearchParams();
  rosterIds.map((id: number) => query.append("rosterId", id.toString()));

  const response: Partial<Roster>[] = await localAPI.get("roster", { query });
  return response.map((roster) => Object.assign(new Roster(), roster));
}
