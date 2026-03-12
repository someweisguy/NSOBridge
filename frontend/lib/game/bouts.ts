import { localAPI } from "@/lib/requests";
import { JamUri, TimeoutUri } from "@/types/query";
import { CacheKey } from "@/types/ws";
import Clock from "./timeouts";

export type BoutStateString =
  | "final"
  | "jam"
  | "lineup"
  | "stopped"
  | "timeout";

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

  getLatestJamUri(): JamUri {
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      // Get the latest Period number that contains Jams
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }
    const jamNum = this.jamCounts[periodNum] - 1;

    return { boutUuid: this.uuid, periodNum, jamNum };
  }

  getActiveJamUri(): JamUri | null {
    let periodNum = 0;
    for (let i = this.jamCounts.length - 1; i >= 0; --i) {
      // Get the latest Period number that contains Jams
      if (this.jamCounts[i] > 0) {
        periodNum = i;
        break;
      }
    }
    if (this.jamCounts[periodNum] < 2) {
      return null; // There is no active Jam
    }
    const jamNum = this.jamCounts[periodNum] - 2;

    return { boutUuid: this.uuid, periodNum, jamNum };
  }

  getLatestTimeoutUri(): TimeoutUri {
    return { boutUuid: this.uuid, timeoutNum: this.timeoutCount - 1 };
  }

  isOvertime(): boolean {
    return this.jamCounts[2] > 0;
  }
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
