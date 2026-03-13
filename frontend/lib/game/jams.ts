import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";

export type StopReasonString = "called" | "elapsed" | "injury" | "other";

export interface TripEvent {
  timestamp: Date;
  lead: boolean;
  lost: boolean;
  passes: number | null;
  starPass: boolean;
}
export class Jam {
  boutUuid: string;
  period: number;
  num: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  stopReason: StopReasonString | null;

  teamJams: TeamJam[];

  /**
   * Generate a cache key for the desired Jam.
   *
   * @param boutUuid the UUID of the Bout associated with the desired Jam.
   * @param periodNum the Period number of the desired Jam.
   * @param jamNum the Jam number of the desired Jam.
   * @returns a cache key for the desired Jam.
   */
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
}

export class TeamJam {
  teamNum: number;
  events: TripEvent[];
}

export async function getJam(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
): Promise<Jam> {
  const data = await localAPI.get<Partial<Jam>>("jam", {
    query: { boutUuid, periodNum, jamNum },
  });
  data.teamJams = data.teamJams?.map((tj) => Object.assign(new TeamJam(), tj));
  return Object.assign(new Jam(), data);
}

export async function addJamTrip(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  passes: number,
) {
  await localAPI.post("jam/addTrip", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: passes,
  });
}

export async function addJamLead(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  lead: boolean,
) {
  await localAPI.post("jam/setLead", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: lead,
  });
}

export async function addJamLost(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  lost: boolean,
) {
  await localAPI.post("jam/setLost", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: lost,
  });
}

export async function addJamStarPass(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  starPass: boolean,
) {
  await localAPI.post("jam/setStarPass", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: starPass,
  });
}
