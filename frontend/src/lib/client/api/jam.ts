import genericRequest from "../request";

export type TeamType = ["home" | "away"];
export type StopReason = ["called", "time", "injury", "other"];

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
  stopReason: StopReason | null;
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
  team: TeamType,
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
    team,
    points,
    valid_pass: validPass,
  });
}

export async function deleteTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamType,
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
    team,
    trip_num: tripNum,
  });
}

export async function editTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamType,
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
    team,
    trip_num: tripNum,
    points,
    timestamp,
  });
}

export async function setLead(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamType,
  value: boolean
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/set-lead", "PUT", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    team,
    value,
  });
}

export async function setLost(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamType,
  value: boolean
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/set-lost", "PUT", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    team,
    value,
  });
}

export async function setStarPass(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamType,
  value: number | null
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/set-star-pass", "PUT", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    team,
    value,
  });
}

export async function setStopReason(
  boutId: string,
  periodNum: number,
  jamNum: number,
  value: StopReason
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/set-stop-reason", "PUT", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
    value,
  });
}
