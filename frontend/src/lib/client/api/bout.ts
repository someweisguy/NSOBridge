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

export function selectActiveJamId(bout: Bout): [number, number] {
  const numJams: [number, number] = bout.numJams;
  const periodNum = Number(numJams[1] > 0);
  const jamNum = numJams[periodNum] - 1;
  return [periodNum, jamNum];
}
