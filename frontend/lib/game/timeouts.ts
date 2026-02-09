import { CacheKey } from "@/types/ws";
import { localAPI } from "../requests";

export async function getTimeout(
  boutUuid: string,
  num: number,
): Promise<Timeout> {
  const data = await localAPI.get<Partial<Timeout>>("timeout", {
    query: { boutUuid, num },
  });
  return Object.assign(new Timeout(), data);
}

export default class Clock {
  startTimestamp: Date | null;
  elapsed: number;
  alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

export class Timeout {
  uuid: string;

  boutUuid: string;
  num: number;

  periodNum: number;
  jamNum: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  teamNum: number | null;
  teamIsOfficials: boolean;
  isReview: boolean;
  details: string;
  result: string;
  retained: boolean;

  static generateKey(boutUuid: string, timeoutId: number): CacheKey {
    return ["timeouts", boutUuid, timeoutId];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }

  async setType(type: "timeout" | "review"): Promise<void> {
    await localAPI.post("timeout/type", {
      query: { boutUuid: this.boutUuid, num: this.num },
      body: JSON.stringify(type),
    });
  }

  async setTeam(teamNum: number | null): Promise<void> {
    await localAPI.post("timeout/team", {
      query: { boutUuid: this.boutUuid, num: this.num },
      body: teamNum,
    });
  }

  async setRetained(isRetained: boolean): Promise<void> {
    await localAPI.post("timeout/retained", {
      query: { boutUuid: this.boutUuid, num: this.num },
      body: isRetained,
    });
  }
}
