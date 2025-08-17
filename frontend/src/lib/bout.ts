import genericRequest from "./requests";

export const HOME = 0;
export const AWAY = 1;

class Clock {
  public readonly startTimestamp: Date | null;
  public readonly elapsed: number;
  public readonly alarm: number;

  constructor(init?: Partial<Clock>) {
    Object.assign(this, init);
    if (this.startTimestamp !== null) {
      this.startTimestamp = new Date(this.startTimestamp);
    }
  }

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

class Timer {
  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly period: number;
  public readonly jam: number;

  constructor(init?: Partial<Timer>) {
    Object.assign(this, init);
    if (this.startTimestamp !== null) {
      this.startTimestamp = new Date(this.startTimestamp);
    }
    if (this.stopTimestamp !== null) {
      this.stopTimestamp = new Date(this.stopTimestamp);
    }
  }
  isRunning(): boolean {
    return this.startTimestamp !== null && this.stopTimestamp !== null;
  }
}

export class Team {
  public readonly name: string;
  public readonly boutScore: number;
  public readonly jamScore: number;
  public readonly timeoutsRemaining: number;
  public readonly reviewsRemaining: number;
  public readonly scoreOffset: number;
}

export class Bout {
  public readonly id: number;
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
    this.clock = new Clock(this.clock);
    this.teams = this.teams.map<Team>((t) => Object.assign(new Team(), t));
    if (this.activeJam !== null) {
      this.activeJam = new Timer(this.activeJam);
    }
    if (this.timer !== null) {
      this.timer = new Timer(this.timer);
    }
  }

  async start(): Promise<void> {
    await genericRequest("rules/start-bout", "POST", { key: this.id });
  }

  async startJam(): Promise<void> {
    await genericRequest("rules/start-jam", "POST", { key: this.id });
  }
}

export interface BoutContext {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}

export async function getBout(key: number): Promise<Bout> {
  const response: Partial<Bout> = await genericRequest("bout", "GET", {
    key,
  });
  return new Bout(response);
}

export async function getBoutContext(key: number): Promise<BoutContext> {
  const response: BoutContext = await genericRequest("bout-context", "GET", {
    key,
  });
  return response;
}
