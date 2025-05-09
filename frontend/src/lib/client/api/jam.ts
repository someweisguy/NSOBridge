import { validate as uuidValidate, version as uuidVersion } from "uuid";
import genericRequest from "../request";

export type JamStopReasons = ["called", "time", "injury", "other"];

export interface TeamJam {
  score: {
    lead: boolean;
    lost: boolean;
    starPass: number | null;
    trips: { points: number; timestamp: Date }[];
  };
}

export interface Jam {
  start: Date | null;
  stop: Date | null;
  stopReason: JamStopReasons | null;
  home: TeamJam;
  away: TeamJam;
}

export async function getJam(
  boutId: string,
  periodNum: number,
  jamNum: number
): Promise<Jam> {
  if (!uuidValidate(boutId) || uuidVersion(boutId) !== 4) {
    throw new Error("Invalid UUID format");
  }
  if (periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  // Wait for time synchronization and then request the Jam
  const response = await genericRequest<Jam>("/api/jam", "GET", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
  });
  return response;
}
