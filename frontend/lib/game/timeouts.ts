import { localAPI } from "../requests";

export async function getTimeout(
  boutId: number,
  index: number,
): Promise<Timeout | null> {
  const data = await localAPI.get("timeout", { query: { boutId, index } });
  return data !== null ? Object.assign(new Timeout(), data) : null;
}

export default class Clock {
  id: number;

  startTimestamp: Date | null;
  elapsed: number;
  alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

export class Timeout {
  id: number;

  boutId: number;
  teamId: number | null;
  jamId: number | null;
  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  teamIsOfficials: boolean;
  isReview: boolean;
  details: string;
  result: string;
  retained: boolean;

  static generateKey(boutId: number, index: number) {
    return ["timeouts", boutId, index];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }

  async setType(type: "timeout" | "review"): Promise<void> {
    await localAPI.post("timeout/type", {
      query: { timeoutId: this.id },
      body: JSON.stringify(type),
    });
  }

  async setTeam(team: number | null): Promise<void> {
    await localAPI.post("timeout/team", {
      query: { timeoutId: this.id },
      body: team,
    });
  }

  async setRetained(isRetained: boolean): Promise<void> {
    await localAPI.post("timeout/retained", {
      query: { timeoutId: this.id },
      body: isRetained,
    });
  }
}
