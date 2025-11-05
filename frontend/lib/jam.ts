import genericRequest from "./requests";

class TeamJam {
  public readonly lead: Date | null;
  public readonly lost: boolean;
  public readonly tripPasses: number[];
  public readonly starPass: number | null;
}

export class Jam {
  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly period: number;
  public readonly num: number;
  public readonly home: TeamJam;
  public readonly away: TeamJam;

  static generateKey(id: number, period: number, num: number) {
    return ["jams", id, period, num];
  }

  constructor(init?: Partial<Jam>) {
    Object.assign(this, init);
    this.home = Object.assign(new TeamJam(), init?.home);
    this.away = Object.assign(new TeamJam(), init?.away);
  }

  leadIsDeclared(): boolean {
    return this.home.lead !== null || this.away.lead !== null;
  }
}

export async function getJam(
  boutId: number,
  periodNum: number,
  jamNum: number,
): Promise<Jam> {
  const response: Partial<Jam> = await genericRequest("jam", "GET", {
    boutId,
    periodNum,
    jamNum,
  });
  return new Jam(response);
}
