import { localAPI } from "@/lib/requests";
import Clock from "./timeouts";

export interface Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}

export async function getBout(boutId: number): Promise<Bout> {
  const data = await localAPI.get("bout", { query: { boutId } });
  return Object.assign(new Bout(), data);
}

export async function getRuleset(boutId: number): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset-context", {
    query: { boutId },
  });
}

export async function createBout(
  rosterIds: number[],
  seriesIndex = 1,
  order = 0,
): Promise<void> {
  await localAPI.post("bout/wftda2025", {
    query: { seriesIndex },
    body: { rosterIds, order },
  });
}

export class Bout {
  id: number;
  seriesId: number;
  ruleset: string;

  startCountdown: Date | null;
  clock: Clock;

  state: "final" | "jam" | "lineup" | "stopped" | "timeout";
  isRunning: boolean;
  isFinal: boolean;
  teams: Team[];
  jamIds: number[][];
  timeoutIds: number[];

  static generateKey(seriesId: number, boutId: number) {
    return ["bouts", seriesId, boutId];
  }

  async beginPeriod(): Promise<void> {
    await localAPI.post("bout/begin-period", { query: { boutId: this.id } });
  }

  async endPeriod(): Promise<void> {
    await localAPI.post("bout/end-period", { query: { boutId: this.id } });
  }

  async startJam(): Promise<void> {
    await localAPI.post("bout/start-jam", { query: { boutId: this.id } });
  }

  async stopJam(): Promise<void> {
    await localAPI.post("bout/stop-jam", { query: { boutId: this.id } });
  }

  async startTimeout(): Promise<void> {
    await localAPI.post("bout/start-timeout", { query: { boutId: this.id } });
  }

  async stopTimeout(): Promise<void> {
    await localAPI.post("bout/stop-timeout", { query: { boutId: this.id } });
  }

  getLatestJamIndex(): [number, number] {
    // Get the latest Period number that contains Jams
    let periodNum = 0;
    for (let i = this.jamIds.length - 1; i >= 0; --i) {
      if (this.jamIds[i].length > 0) {
        periodNum = i;
        break;
      }
    }

    // Get the latest Jam number in the active Period
    const jamNum = this.jamIds[periodNum].length - 1;

    return [periodNum, jamNum];
  }

  getActiveJamIndex(): [number, number] | null {
    // Get the latest Period number that contains Jams
    let periodNum = 0;
    for (let i = this.jamIds.length - 1; i >= 0; --i) {
      if (this.jamIds[i].length > 0) {
        periodNum = i;
        break;
      }
    }

    // Get the active Jam number in the active Period
    if (this.jamIds[periodNum].length < 2) {
      return null; // There is no active Jam
    }
    const jamNum = this.jamIds[periodNum].length - 2;

    return [periodNum, jamNum];
  }

  getLatestTimeoutIndex(): number {
    let timeoutIndex = this.timeoutIds.length - 1;
    if (timeoutIndex < 0) {
      timeoutIndex = 0;
    }
    return timeoutIndex;
  }

  // TODO: getActiveTimeoutIndex()
}

export class Team {
  id: number;
  rosterId: number;
  boutId: number;
  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}
