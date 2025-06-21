import genericRequest from "../request";
import { Bout } from "./types";

export interface TimeoutState {
  isReview: boolean;
  team: number | "official" | null;
  details: string;
  result: string;
  retained: boolean;
}

export async function getBout(boutId: string): Promise<Bout> {
  const response = await genericRequest<Bout>("/api/bout", "GET", {
    bout_id: boutId,
  });

  // TODO: handle errors

  return response;
}

export async function startJam(boutId: string): Promise<undefined> {
  await genericRequest<Bout>(
    "/api/bout/start-jam",
    "POST",
    {
      bout_id: boutId,
    },
    new Date()
  );
}

export async function stopJam(boutId: string): Promise<undefined> {
  await genericRequest<Bout>(
    "/api/bout/stop-jam",
    "POST",
    {
      bout_id: boutId,
    },
    new Date()
  );
}

export function offsetJamId(
  bout: Bout,
  jamId: [number, number],
  offset: number
): [number, number] | null {
  let [periodNum, jamNum] = jamId;

  // Convert the initial Jam vector to a scalar and apply an offset
  let jamScalar = bout.numJams
    .slice(0, periodNum)
    .reduce((acc, i) => acc + i, jamNum + offset);

  // Calculate the new Jam vector
  if (jamScalar < 0) {
    return null;
  }
  periodNum = 0;
  while (jamScalar >= bout.numJams[periodNum]) {
    jamScalar -= bout.numJams[periodNum];
    ++periodNum;
    if (periodNum > bout.numJams.length) {
      return null;
    }
  }
  jamNum = jamScalar;
  if (jamNum >= bout.numJams[periodNum]) {
    return null;
  }

  return [periodNum, jamNum];
}

export async function callTimeout(boutId: string): Promise<undefined> {
  await genericRequest<Bout>(
    "/api/bout/call-timeout",
    "POST",
    {
      bout_id: boutId,
    },
    new Date()
  );
}

export async function endTimeout(boutId: string): Promise<undefined> {
  await genericRequest<Bout>(
    "/api/bout/end-timeout",
    "POST",
    {
      bout_id: boutId,
    },
    new Date()
  );
}

export async function editTimeout(
  boutId: string,
  timeoutNum: number,
  state: TimeoutState
) {
  await genericRequest<Bout>(
    "/api/bout/timeout",
    "PUT",
    {
      bout_id: boutId,
      timeout_id: timeoutNum,
    },
    { ...state, is_review: state.isReview }
  );
}

export async function endPeriod(boutId: string) {
  await genericRequest(
    "/api/bout/end-period",
    "POST",
    {
      bout_id: boutId,
    },
    Date.now()
  );
}
