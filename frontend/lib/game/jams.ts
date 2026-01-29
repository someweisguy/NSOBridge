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
  boutUuid: string;
  period: number;
  num: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  stopReason: StopReasonString | null;

  teamJams: TeamJam[];

  static generateKey(
    boutUuid?: string,
    periodNum?: number,
    jamNum?: number,
  ): CacheKey {
    return ["jams", boutUuid, periodNum, jamNum];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }

  async addTrip(teamJam: TeamJam, passes: number) {
    await localAPI.post("jam/addTrip", {
      query: {
        boutUuid: this.boutUuid,
        period: this.period,
        num: this.num,
        teamNum: teamJam.teamNum,
      },
      body: passes,
    });
  }

  async setLead(teamJam: TeamJam, lead: boolean) {
    await localAPI.post("jam/setLead", {
      query: {
        boutUuid: this.boutUuid,
        period: this.period,
        num: this.num,
        teamNum: teamJam.teamNum,
      },
      body: lead,
    });
  }

  async setLost(teamJam: TeamJam, lost: boolean) {
    await localAPI.post("jam/setLost", {
      query: {
        boutUuid: this.boutUuid,
        period: this.period,
        num: this.num,
        teamNum: teamJam.teamNum,
      },
      body: lost,
    });
  }

  async setStarPass(teamJam: TeamJam, starPass: boolean) {
    await localAPI.post("jam/setStarPass", {
      query: {
        boutUuid: this.boutUuid,
        period: this.period,
        num: this.num,
        teamNum: teamJam.teamNum,
      },
      body: starPass,
    });
  }
}

export class TeamJam {
  teamNum: number;
  events: TripEvent[];
}

export interface TripEvent {
  timestamp: Date;
  lead: boolean;
  lost: boolean;
  passes: number | null;
  starPass: boolean;
}
