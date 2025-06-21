import genericRequest from "../request";
import { Jam, StopReasonString } from "./types";

export async function getJam(
  boutId: string,
  periodNum: number,
  jamNum: number
): Promise<Jam> {
  if (!Number.isInteger(periodNum) || periodNum < 0) {
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
  team: number,
  passes: number,
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
    passes,
  );
}

export async function deleteTrip(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: number,
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
  team: number,
  tripNum: number,
  points: number
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
  team: number,
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
    "POST",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    value
  );
}

export async function setLost(
  boutId: string,
  periodNum: number,
  jamNum: number,
  team: number,
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
    "POST",
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
  team: number,
  value: boolean | null
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/star-pass",
    "POST",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
      team,
    },
    value
  );
}

export async function setStopReason(
  boutId: string,
  periodNum: number,
  jamNum: number,
  value: StopReasonString
): Promise<void> {
  if (!Number.isInteger(periodNum) || periodNum < 0 || periodNum > 1) {
    throw new Error("Invalid Period Number");
  }
  if (!Number.isInteger(jamNum) || jamNum < 0) {
    throw new Error("Invalid Jam Number");
  }

  await genericRequest(
    "/api/jam/stop-reason",
    "POST",
    {
      bout_id: boutId,
      period_num: periodNum,
      jam_num: jamNum,
    },
    value
  );
}
