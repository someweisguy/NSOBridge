import genericRequest from "../requests";

export class Roster {
  readonly id: number;
  readonly name: string;

  static generateKey(id: number) {
    return ["rosters", id];
  }

  constructor(init: Partial<Roster>) {
    Object.assign(this, init);
  }
}

export async function getRosters(rosterIds: number[]): Promise<Roster[]> {
  const params = new URLSearchParams();
  rosterIds.map((id: number) => params.append("rosterId", id.toString()));
  const response: Partial<Roster>[] = await genericRequest(
    "roster",
    "GET",
    params,
  );
  return response.map((roster) => new Roster(roster));
}
