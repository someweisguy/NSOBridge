import genericRequest from "../request";

export interface Clock {
  startTimestamp: Date | null;
  elapsed: number;
  alarm: number;
}

export interface Timeouts {
  timeoutsRemaining: number;
  officialReviewsRemaining: number;
}

export interface Bout {
  gameNumber: number | null;
  timer: {
    clocks: {
      intermission: Clock;
      game: Clock;
      lineup: Clock;
      jam: Clock;
      timeout: Clock;
    };
    timeouts: {
      home: Timeouts;
      away: Timeouts;
    };
  };
  numJams: [number, number];
  score: {
    home: number;
    away: number;
  };
}

export async function getBout(boutId: string): Promise<Bout> {
  const response = await genericRequest<Bout>("/api/bout", "GET", {
    bout_id: boutId,
  });

  // TODO: handle errors

  return response;
}

export async function startJam(boutId: string): Promise<undefined> {
  await genericRequest<Bout>("/api/bout/start-jam", "POST", {
    bout_id: boutId,
    timestamp: new Date(),
  });
}

export async function stopJam(boutId: string): Promise<undefined> {
  await genericRequest<Bout>("/api/bout/stop-jam", "POST", {
    bout_id: boutId,
    timestamp: new Date(),
  });
}

export function selectLatestJamId(
  bout: Bout,
  offset = 0,
  returnOutOfBounds = false
): [number, number] | null {
  const numJams: [number, number] = bout.numJams;
  const periodNum = Number(numJams[1] > 0);
  const jamNum = numJams[periodNum] - 1;
  return offsetJamId(offset, [periodNum, jamNum], numJams, returnOutOfBounds);
}

export function offsetJamId(
  offset: number,
  jamId: [number, number],
  numJams: [number, number],
  returnOutOfBounds = false
): [number, number] | null {
  // Turn the Jam vector into a scalar
  let jamScalar: number = jamId[1] + jamId[0] * numJams[0];

  // Apply an offset
  jamScalar += offset;

  // Convert the Jam scalar back into a vector
  const periodNum = Number(jamScalar > numJams[0]);
  const jamNum = jamScalar - periodNum * numJams[0];
  const jamVector: [number, number] = [periodNum, jamNum];

  // Validate that the new Jam vector is within bounds
  if (
    !returnOutOfBounds &&
    (jamScalar < 0 || jamScalar >= numJams[0] + numJams[1])
  ) {
    return null;
  }
  return jamVector;
}
