import genericRequest from "./requests";

export const HOME = 0;
export const AWAY = 1;

type DateToString<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: DateToString<T[K]> }
    : T;

function nullOrDate(dateString: string | null): Date | null {
  if (dateString === null) {
    return null;
  }
  if (!Date.parse(dateString)) {
    throw new Error("Invalid datetime string");
  }
  return new Date(dateString);
}

class Clock {
  public readonly startTimestamp: Date | null;
  public readonly elapsed: number;
  public readonly alarm: number;

  constructor(init: DateToString<Clock>) {
    this.startTimestamp = nullOrDate(init.startTimestamp);
    this.elapsed = init.elapsed;
    this.alarm = init.alarm;
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

  constructor(init: DateToString<Timer>) {
    this.startTimestamp = nullOrDate(init.startTimestamp);
    this.stopTimestamp = nullOrDate(init.stopTimestamp);
    this.period = init.period;
    this.jam = init.jam;
  }

  hasStarted(): boolean {
    return this.startTimestamp !== null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp === null;
  }
}

class Timeout extends Timer {
  constructor(init: DateToString<Timeout>) {
    super(init);
  }
}

class TeamJam {
  public readonly teamId: number;
  public readonly lead: Date | null;
  public readonly lost: boolean;
  public readonly starPass: boolean;
}

class Jam extends Timer {
  public readonly home: TeamJam;
  public readonly away: TeamJam;

  constructor(init: DateToString<Jam>) {
    super(init);
    this.home = Object.assign(new TeamJam(), init.home);
    this.away = Object.assign(new TeamJam(), init.away);
  }
}

export class Team {
  public readonly id: number;
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
  public readonly activeJam: Jam | null;
  public readonly activeTimeout: Timeout | null;

  static generateKey(id: number) {
    return ["bouts", id];
  }

  constructor(init: DateToString<Bout>) {
    Object.assign(this, init);
    this.clock = new Clock(init.clock);
    this.expectedStartTimestamp = nullOrDate(init.expectedStartTimestamp);
    if (init.activeJam !== null) {
      this.activeJam = new Jam(init.activeJam);
    }
    if (init.activeTimeout !== null) {
      this.activeTimeout = new Timeout(init.activeTimeout);
    }
    this.teams = init.teams.map<Team>((t) => Object.assign(new Team(), t));
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
    await genericRequest("bout/setup-track", "POST", { boutId: this.id });
  }

  async clearTrack(): Promise<void> {
    await genericRequest("bout/clear-track", "POST", { boutId: this.id });
  }

  async startJam(): Promise<void> {
    await genericRequest("bout/start-jam", "POST", { boutId: this.id });
  }

  async stopJam(): Promise<void> {
    await genericRequest("bout/stop-jam", "POST", { boutId: this.id });
  }

  async callTimeout(): Promise<void> {
    await genericRequest("bout/call-timeout", "POST", { boutId: this.id });
  }

  async endTimeout(): Promise<void> {
    await genericRequest("bout/end-timeout", "POST", { boutId: this.id });
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
  const response: DateToString<Bout> = await genericRequest("bout", "GET", {
    boutId,
  });
  return new Bout(response);
}

export async function getBoutContext(boutId: number): Promise<BoutContext> {
  const response: BoutContext = await genericRequest("bout/context", "GET", {
    boutId,
  });
  return response;
}

export async function createBout(
  rosterIds: number[],
  seriesIndex = 1,
  order = 0,
): Promise<void> {
  await genericRequest(
    "bout/wftda2025",
    "POST",
    { seriesIndex },
    { rosterIds, order },
  );
}
