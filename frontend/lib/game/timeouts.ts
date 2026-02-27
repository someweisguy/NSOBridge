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
}

export async function setType(
  boutUuid: string,
  timeoutNum: number,
  type: "timeout" | "review",
): Promise<void> {
  await localAPI.post("timeout/type", {
    query: { boutUuid, num: timeoutNum },
    body: JSON.stringify(type),
  });
}

export async function setTeam(
  boutUuid: string,
  timeoutNum: number,
  teamNum: number | null,
): Promise<void> {
  await localAPI.post("timeout/team", {
    query: { boutUuid, num: timeoutNum },
    body: teamNum,
  });
}

export async function setRetained(
  boutUuid: string,
  timeoutNum: number,
  isRetained: boolean,
): Promise<void> {
  await localAPI.post("timeout/retained", {
    query: { boutUuid, num: timeoutNum },
    body: isRetained,
  });
}
