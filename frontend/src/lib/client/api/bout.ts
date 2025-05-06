import { validate as uuidValidate, version as uuidVersion } from "uuid";
import genericRequest from "../request";
import adjustServerTime from "../sync";

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

export async function getBout(uuid: string): Promise<Bout> {
  if (!uuidValidate(uuid) || uuidVersion(uuid) !== 4) {
    throw new Error("Invalid UUID format");
  }
  const response = await genericRequest<Bout>("/bout", "GET", { uuid });

  // TODO: handle errors

  let bout: Bout = response.data;

  // Set the start timestamp for each clock to local time
  const clocks = bout.timer.clocks;
  for (let clock of [clocks.game, clocks.jam, clocks.timeout]) {
    if (clock.startTimestamp !== null) {
      clock.startTimestamp = adjustServerTime(clock.startTimestamp);
    }
  }

  return response.data;
}
