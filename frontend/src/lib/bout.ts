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

  hasStarted(): boolean {
    return this.startTimestamp !== null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp === null;
  }
}

class Timeout extends Timer {
  constructor(init?: Partial<Timeout>) {
    super(init);
  }
}

export class Team {
  public readonly roster: { id: number; name: string };
  public readonly boutScore: number;
  public readonly jamScore: number;
  public readonly timeoutsRemaining: number;
  public readonly reviewsRemaining: number;
  public readonly scoreOffset: number;
}

export class Bout {
  public readonly id: number;
  public readonly ruleset: string;
  public readonly expectedStartTimestamp: Date | null;
  public readonly isFinal: boolean;
  public readonly jamCounts: number[];
  public readonly timeoutCounts: number[];
  public readonly clock: Clock;
  public readonly teams: Team[];
  public readonly activeJam: Timer | null;
  public readonly activeTimeout: Timeout | null;

  static generateKey(id: number) {
    return ["bouts", id];
  }

  constructor(init?: Partial<Bout>) {
    Object.assign(this, init);
    this.clock = new Clock(this.clock);
    if (this.expectedStartTimestamp !== null) {
      this.expectedStartTimestamp = new Date(this.expectedStartTimestamp);
    }
    if (this.activeJam !== null) {
      this.activeJam = new Timer(this.activeJam);
    }
    if (this.activeTimeout !== null) {
      this.activeTimeout = new Timeout(this.activeTimeout);
    }
    this.teams = this.teams.map<Team>((t) => Object.assign(new Team(), t));
  }

  getState(): "final" | "jam" | "lineup" | "stopped" | "timeout" {
    if (this.isFinal) {
      return "final";
    } else if (this.activeJam?.isRunning()) {
      return "jam";
    } else if (this.activeTimeout?.isRunning()) {
      return "timeout";
    } else if (this.activeJam !== null) {
      return "lineup";
    } else {
      return "stopped";
    }
  }

  async setupTrack(): Promise<void> {
    await genericRequest("rules/setup-track", "POST", { key: this.id });
  }

  async clearTrack(): Promise<void> {
    await genericRequest("rules/clear-track", "POST", { key: this.id });
  }

  async startJam(): Promise<void> {
    await genericRequest("rules/start-jam", "POST", { key: this.id });
  }

  async stopJam(): Promise<void> {
    await genericRequest("rules/stop-jam", "POST", { key: this.id });
  }

  async callTimeout(): Promise<void> {
    await genericRequest("rules/call-timeout", "POST", { key: this.id });
  }

  async endTimeout(): Promise<void> {
    await genericRequest("rules/end-timeout", "POST", { key: this.id });
  }
}

export interface BoutContext {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}

export async function getBout(boutId: number): Promise<Bout> {
  const response: Partial<Bout> = await genericRequest("bout", "GET", {
    boutId,
  });
  return new Bout(response);
}

export async function getBoutContext(boutId: number): Promise<BoutContext> {
  const response: BoutContext = await genericRequest("bout-context", "GET", {
    boutId,
  });
  return response;
}
