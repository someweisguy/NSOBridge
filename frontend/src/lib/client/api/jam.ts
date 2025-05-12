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
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
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

export async function addTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  points: number,
  validPass = true
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/add-trip", "POST", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    points,
    valid_pass: validPass,
  });
}

export async function deleteTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  tripNum: number
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/delete-trip", "DELETE", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    trip_num: tripNum,
  });
}

export async function editTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  tripNum: number,
  points: number | null,
  timestamp: Date | null = null
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/edit-trip", "PUT", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    trip_num: tripNum,
    points,
    timestamp,
  });
}
