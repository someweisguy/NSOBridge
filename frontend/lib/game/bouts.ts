import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";
import Clock from "./timeouts";

export type BoutStateString =
  | "final"
  | "jam"
  | "lineup"
  | "stopped"
  | "timeout";

export class Bout {
  uuid: string;
  seriesUuid: string;
  rulesetName: string;

  startCountdown: Date | null;
  clock: Clock;

  state: BoutStateString;
  isRunning: boolean;
  isFinal: boolean;
  teams: Team[];
  jamCounts: [number, number, number];
  timeoutCount: number;

  static generateKey(boutUuid?: string): CacheKey {
    if (boutUuid == undefined) {
      return ["bouts"];
    }
    return ["bouts", boutUuid];
  }

  async stopTimeout(): Promise<void> {
    await localAPI.post("bout/stopTimeout", { query: { boutUuid: this.uuid } });
  }

  getLatestJamNum(): [number, number] {
    // Get the latest Period number that contains Jams
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }

    // Get the latest Jam number in the active Period
    const jamNum = this.jamCounts[periodNum] - 1;

    return [periodNum, jamNum];
  }

  getActiveJamNum(): [number, number] | null {
    // Get the latest Period number that contains Jams
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }

    // Get the active Jam number in the active Period
    if (this.jamCounts[periodNum] < 2) {
      return null; // There is no active Jam
    }
    const jamNum = this.jamCounts[periodNum] - 2;

    return [periodNum, jamNum];
  }

  getActiveOrLatestJamNum(): [number, number] {
    return this.getActiveJamNum() ?? this.getLatestJamNum();
  }

  getLatestTimeoutNum(): number {
    let timeoutIndex = this.timeoutCount - 1;
    if (timeoutIndex < 0) {
      timeoutIndex = 0;
    }
    return timeoutIndex;
  }

  getActiveTimeoutNum(): number | null {
    if (this.timeoutCount < 2) {
      return null; // There is no active Timeout
    }

    return this.timeoutCount - 2;
  }

  getActiveOrLatestTimeoutIndex(): number {
    return this.getActiveTimeoutNum() ?? this.getLatestTimeoutNum();
  }

  isOvertime(): boolean {
    return this.jamCounts[2] > 0;
  }
}

export interface Team {
  num: number;

  name: string;
  league: string;
  mnemonic: string;

  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}

export async function getBout(boutUuid: string): Promise<Bout> {
  const data = await localAPI.get<Partial<Bout>>("bout", {
    query: { boutUuid },
  });
  return Object.assign(new Bout(), data);
}

export async function getAllBouts(): Promise<Bout[]> {
  const data = await localAPI.get<Partial<Bout>[]>("bout/allBouts");
  return data.map((bout: Partial<Bout>) => Object.assign(new Bout(), bout));
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

export async function beginPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/beginPeriod", { query: { boutUuid } });
}

export async function endPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/endPeriod", { query: { boutUuid } });
}

export async function startJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startJam", { query: { boutUuid } });
}

export async function stopJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopJam", { query: { boutUuid } });
}

export async function startTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startTimeout", {
    query: { boutUuid },
  });
}

export async function stopTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopTimeout", {
    query: { boutUuid },
  });
}
