import { validate as uuidValidate, version as uuidVersion } from "uuid";
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
      game: Clock;
      jam: Clock;
      timeout: Clock;
      inIntermission: boolean;
      inLineup: boolean;
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
  if (!uuidValidate(boutId) || uuidVersion(boutId) !== 4) {
    throw new Error("Invalid UUID format");
  }

  // Wait for time synchronization and then request the Bout
  const response = await genericRequest<Bout>("/bout", "GET", {
    bout_id: boutId,
  });

  // TODO: handle errors

  return response.data;
}

export async function startJam(boutId: string): Promise<undefined> {
  if (!uuidValidate(boutId) || uuidVersion(boutId) !== 4) {
    throw new Error("Invalid UUID format");
  }

  // Wait for time synchronization and then send the request
  await genericRequest<Bout>("/bout/start-jam", "POST", {
    bout_id: boutId,
    timestamp: new Date(),
  });
}

export async function stopJam(boutId: string): Promise<undefined> {
  if (!uuidValidate(boutId) || uuidVersion(boutId) !== 4) {
    throw new Error("Invalid UUID format");
  }

  // Wait for time synchronization and then send the request
  await genericRequest<Bout>("/bout/stop-jam", "POST", {
    bout_id: boutId,
    timestamp: new Date(),
  });
}
