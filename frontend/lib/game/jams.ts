import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";

export async function getJam(
  boutUuid: string,
  period: number,
  num: number,
): Promise<Jam> {
  const data = await localAPI.get<Partial<Jam>>("jam", {
    query: { boutUuid, period, num },
  });
  data.teamJams = data.teamJams?.map((tj) => Object.assign(new TeamJam(), tj));
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

  static generateKey(
    boutUuid: string,
    periodNum: number,
    jamNum: number,
  ): CacheKey {
    return ["jams", boutUuid, periodNum, jamNum];
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
  events: TripEvent[];

  async addTrip(passes: number) {
    await localAPI.post("jam/addTrip", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: passes,
    });
  }

  async setLead(lead: boolean) {
    await localAPI.post("jam/setLead", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: lead,
    });
  }

  async setLost(lost: boolean) {
    await localAPI.post("jam/setLost", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: lost,
    });
  }

  async setStarPass(starPass: boolean) {
    await localAPI.post("jam/setStarPass", {
      query: { jamId: this.jamId, teamId: this.teamId },
      body: starPass,
    });
  }
}

export interface TripEvent {
  id: number;
  timestamp: Date;
  lead: boolean;
  lost: boolean;
  passes: number | null;
  starPass: boolean;
}
