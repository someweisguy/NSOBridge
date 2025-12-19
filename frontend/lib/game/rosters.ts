import { Roster } from "@/types/people";
import { localAPI } from "../requests";

export default async function getRoster(id: number): Promise<Roster> {
  return await localAPI.get("roster", { query: { id } });
}
