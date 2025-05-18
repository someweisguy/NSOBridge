import genericRequest from "../request";

export type TeamString = "home" | "away";
export type StopReason = "called" | "time" | "injury" | "other";

export interface Trip {
  points: number;
  timestamp: Date;
}

export interface TeamJam {
  score: {
    lead: boolean;
    lost: boolean;
    starPass: number | null;
    trips: Trip[];
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
  team: TeamString,
  points: number,
  validPass = true
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/trip",
    "POST",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    {
      points,
      valid_pass: validPass,
    }
  );
}

export async function deleteTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamString,
  tripNum: number
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest("/api/jam/trip", "DELETE", {
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
  team: TeamString,
  tripNum: number,
  points: number,
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/trip",
    "PUT",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
      trip_num: tripNum,
    },
    points
  );
}

export async function setLead(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamString,
  value: boolean
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/lead",
    "PUT",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    value,
  );
}

export async function setLost(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamString,
  value: boolean
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/lost",
    "PUT",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    value
  );
}

export async function setStarPass(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: TeamString,
  value: number | null
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/star-pass",
    "PUT",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    value,
  );
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

  await genericRequest(
    "/api/jam/stop-reason",
    "PUT",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
    },
    value,
  );
}
