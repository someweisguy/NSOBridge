import genericRequest from "../request";
import { Bout } from "./types";

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
  offset: number,
  returnOutOfBounds = false
): [number, number] | null {
  // Turn the Jam vector into a scalar
  let jamScalar: number = jamId[1] + jamId[0] * bout.numJams[0];

  // Apply an offset
  jamScalar += offset;

  // Convert the Jam scalar back into a vector
  const periodNum = Number(jamScalar > bout.numJams[0]);
  const jamNum = jamScalar - periodNum * bout.numJams[0];
  const jamVector: [number, number] = [periodNum, jamNum];

  // Validate that the new Jam vector is within bounds
  if (
    !returnOutOfBounds &&
    (jamScalar < 0 || jamScalar >= bout.numJams[0] + bout.numJams[1])
  ) {
    return null;
  }
  return jamVector;
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
