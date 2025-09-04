import genericRequest from "./requests";

interface Team {
  id: number;
  name: string;
  boutScore: number;
  jamScore: number;
  scoreOffset: number;
}

interface Bout {
  id: number;
  ruleset: string;
  isRunning: boolean;
  isFinal: boolean;
  teams: Team[];
  period: number;
  jam: number;
}

export interface Series {
  id: number;
  name: string;
  bouts: Bout[];
}

export async function getSeries(key: number): Promise<Series> {
  return await genericRequest("series", "GET", {
    key,
  });
}
