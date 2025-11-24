import genericRequest from "@/shared/lib/requests";

class TeamJam {
  public readonly id: number;
  public readonly teamId: number;
  public readonly events: {
    readonly id: number;
    readonly timestamp: Date;
    readonly lead: boolean;
    readonly lost: boolean;
    readonly passes: number | null;
    readonly starPass: boolean;
  };
}

export class Jam {
  public readonly boutId: number;
  public readonly period: number;
  public readonly num: number;

  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly stopReason: string | null;

  public readonly teamJams: TeamJam[];

  static generateKey(id: number, period: number, num: number) {
    return ["jams", id, period, num];
  }

  constructor(init?: Partial<Jam>) {
    Object.assign(this, init);
    this.startTimestamp =
      init?.startTimestamp == null ? null : new Date(init.startTimestamp);
    this.stopTimestamp =
      init?.stopTimestamp == null ? null : new Date(init.stopTimestamp);
    this.teamJams = init!.teamJams!.map((teamJam) =>
      Object.assign(new TeamJam(), teamJam),
    );
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
}

export async function getJam(
  cacheKey: ReturnType<typeof Jam.generateKey>,
): Promise<Jam | null> {
  const [, boutId, periodNum, jamNum] = cacheKey;
  const response: Partial<Jam> | null = await genericRequest("jam", "GET", {
    boutId,
    periodNum,
    jamNum,
  });
  return response ? new Jam(response) : response;
}
