import genericRequest from "./requests";

class Clock {
  public readonly startTimestamp: Date | null;
  public readonly elapsed: number;
  public readonly alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

class Timer {
  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly period: number;
  public readonly jam: number;

  isRunning(): boolean {
    return this.startTimestamp !== null && this.stopTimestamp !== null;
  }
}

class Team {
  public readonly boutScore: number;
  public readonly jamScore: number;
  public readonly timeoutsRemaining: number;
  public readonly reviewsRemaining: number;
  public readonly scoreOffset: number;
}

export class Bout {
  public readonly ruleset: string;
  public readonly jamCounts: number[];
  public readonly numTimeouts: number;
  public readonly timerType: "timeout" | "intermission" | null;
  public readonly clock: Clock;
  public readonly teams: Team[];
  public readonly activeJam: Timer | null;
  public readonly timer: Timer | null;

  static generateKey(id: number) {
    return ["bouts", id];
  }

  constructor(init?: Partial<Bout>) {
    Object.assign(this, init);
    this.clock = Object.assign(new Clock(), init?.clock);
    this.teams = this.teams.map<Team>((t) => Object.assign(new Team(), t));
    if (this.activeJam !== null) {
      this.activeJam = Object.assign(new Timer(), init?.activeJam);
    }
    if (this.timer !== null) {
      this.timer = Object.assign(new Timer(), init?.timer);
    }
  }
}

export async function getBout(key: number): Promise<Bout> {
  const response: Partial<Bout> = await genericRequest("bout", "GET", {
    key,
  });
  return new Bout(response);
}
