import genericRequest from "./requests";

export interface Roster {
  readonly id: number;
  readonly name: string;
}

export async function getRosters(rosterIds: number[]): Promise<Roster[]> {
  const params = new URLSearchParams();
  rosterIds.map((id: number) => params.append("rosterId", id.toString()));
  const response: Roster[] = await genericRequest("roster", "GET", params);
  return response;
}
