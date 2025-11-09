import genericRequest from "../requests";
import Clock from "./clocks";

type DateToString<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: DateToString<T[K]> }
    : T;

export class Team {
  public readonly id: number;
  public readonly rosterId: number;
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
  public readonly clock: Clock;

  public readonly state: "final" | "jam" | "lineup" | "stopped" | "timeout";
  public readonly isRunning: boolean;
  public readonly isFinal: boolean;
  public readonly jamCounts: number[];
  public readonly numTimeouts: number[];
  public readonly teams: Team[];

  static generateKey(id: number) {
    return ["bouts", id];
  }

  constructor(init: DateToString<Bout>) {
    Object.assign(this, init);
    this.clock = new Clock(init.clock);
    this.expectedStartTimestamp =
      init.expectedStartTimestamp == null
        ? null
        : new Date(init.expectedStartTimestamp);
    this.teams = init.teams.map<Team>((t) => Object.assign(new Team(), t));
  }

  async setupTrack(): Promise<void> {
    await genericRequest("bout/setup-track", "POST", { boutId: this.id }).catch(
      (e) => console.error(e),
    );
  }

  async clearTrack(): Promise<void> {
    await genericRequest("bout/clear-track", "POST", { boutId: this.id }).catch(
      (e: Error) => console.error(e.message),
    );
  }

  async startJam(): Promise<void> {
    await genericRequest("bout/start-jam", "POST", { boutId: this.id }).catch(
      (e: Error) => console.error(e.message),
    );
  }

  async stopJam(): Promise<void> {
    await genericRequest("bout/stop-jam", "POST", { boutId: this.id }).catch(
      (e: Error) => console.error(e.message),
    );
  }

  async callTimeout(): Promise<void> {
    await genericRequest("bout/call-timeout", "POST", {
      boutId: this.id,
    }).catch((e: Error) => console.error(e.message));
  }

  async endTimeout(): Promise<void> {
    await genericRequest("bout/end-timeout", "POST", { boutId: this.id }).catch(
      (e: Error) => console.error(e.message),
    );
  }

  async setExpectedStart(timestamp: Date): Promise<void> {
    await genericRequest(
      "bout/expected-start",
      "POST",
      { boutId: this.id },
      timestamp,
    ).catch((e: Error) => console.error(e.message));
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
  ).catch((e: Error) => console.error(e.message));
}
