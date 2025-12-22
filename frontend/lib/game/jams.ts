import { localAPI } from "../requests";

export async function getJam(id: number): Promise<Jam> {
  const data = await localAPI.get("jam", { query: { id } });
  return Object.assign(new Jam(), data);
}

export type StopReasonString = "called" | "elapsed" | "injury" | "other";

export class Jam {
  id: number;
  boutId: number;
  period: number;
  num: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  stopReason: StopReasonString | null;

  teamJams: TeamJam[];

  static generateKey(id: number, period: number, num: number) {
    return ["jams", id, period, num];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
}

export class TeamJam {
  jamId: number;
  teamId: number;
  events: {
    id: number;
    timestamp: Date;
    lead: boolean;
    lost: boolean;
    passes: number | null;
    starPass: boolean;
  }[];

  async addTrip(passes: number) {
    await localAPI.post("jam/add-trip", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: passes,
    });
  }

  async setLead(lead: boolean) {
    await localAPI.post("jam/set-lead", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: lead,
    });
  }

  async setLost(lost: boolean) {
    await localAPI.post("jam/set-lost", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: lost,
    });
  }

  async setStarPass(starPass: boolean) {
    await localAPI.post("jam/set-star-pass", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: starPass,
    });
  }
}
