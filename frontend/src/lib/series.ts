import genericRequest from "./requests";

interface Team {
  readonly id: number;
  readonly name: string;
  readonly boutScore: number;
  readonly jamScore: number;
  readonly scoreOffset: number;
}

interface Bout {
  readonly id: number;
  readonly ruleset: string;
  readonly isRunning: boolean;
  readonly isFinal: boolean;
  readonly teams: Team[];
  readonly period: number;
  readonly jam: number;
}

export interface Series {
  readonly id: number;
  readonly name: string;
  readonly bouts: Bout[];
}

export async function getSeries(index: number): Promise<Series> {
  return await genericRequest("series", "GET", {
    index,
  });
}
