import { validate as uuidValidate, version as uuidVersion } from "uuid";
import genericRequest from "../request";
import adjustServerTime, { timeIsSynchronized } from "../sync";

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
  await timeIsSynchronized;
  const response = await genericRequest<Bout>("/bout", "GET", {
    bout_id: boutId,
  });

  // TODO: handle errors

  // Set the start timestamp for each clock to local time
  const clocks = response.data.timer.clocks;
  for (const clock of [clocks.game, clocks.jam, clocks.timeout]) {
    if (clock.startTimestamp !== null) {
      clock.startTimestamp = adjustServerTime(clock.startTimestamp);
    }
  }

  return response.data;
}
