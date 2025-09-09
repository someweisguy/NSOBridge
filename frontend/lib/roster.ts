import genericRequest from "./requests";

export interface Roster {
  readonly id: number;
  readonly name: string;
}

export async function getRosters(rosterIds: number[]): Promise<Roster> {
  const params = new URLSearchParams();
  rosterIds.map((id: number) => params.append("rosterId", String(id)));
  const response: Roster = await genericRequest("roster", "GET", params);
  return response;
}
