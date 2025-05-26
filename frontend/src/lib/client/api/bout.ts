import genericRequest from "../request";
import { TeamString } from "./jam";

export type TeamOfficialString = TeamString | "official";
export type TimeoutType = "timeout" | "review";
export type GameStateType =
  | "intermission"
  | "stopped"
  | "lineup"
  | "jam"
  | "timeout";

export interface TeamInfo {
  name: string;
  mnemonic: string;
  score: number;
  clockStops: {
    timeout: number;
    review: number
  }
}

export interface Timer {
  startTimestamp: Date | null;
  elapsed: number;
}

export interface Alarm extends Timer {
  alarm: number;
}

export interface Timeout {
  type: TimeoutType;
  team: TeamOfficialString;
  periodNumber: number;
  jamNumber: number;
  periodClockElapsed: number;
  duration: number;
  details: string;
  result: string;
  retained: boolean;
}

export interface Bout {
  gameNumber: number | null;
  home: TeamInfo;
  away: TeamInfo;
  timer: {
    clocks: {
      intermission: Alarm;
      game: Alarm;
      lineup: Alarm;
      jam: Alarm;
      timeout: Timer;
    };
    timeouts: Timeout[];
  };
  numJams: [number, number];
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

export function selectLatestJamId(
  bout: Bout,
  offset = 0,
  returnOutOfBounds = false
): [number, number] {
  const numJams: [number, number] = bout.numJams;
  const periodNum = Number(numJams[1] > 0);
  const jamNum = numJams[periodNum] - 1;
  return offsetJamId(bout, [periodNum, jamNum], offset, returnOutOfBounds)!;
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

export function selectActiveJamId(
  bout: Bout,
  offset = 0,
  returnOutOfBounds = false
): [number, number] | null {
  const latestJamId: [number, number] = selectLatestJamId(bout);

  // Turn the Jam vector into a scalar
  let jamScalar: number = latestJamId[1] + latestJamId[0] * bout.numJams[0];

  // Apply an offset and subtract one if the Jam timer isn't running
  jamScalar += offset - Number(bout.timer.clocks.jam.startTimestamp === null);

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

export function selectGameState(bout: Bout): GameStateType {
  const clocks = bout.timer.clocks;
  if (clocks.jam.startTimestamp !== null) {
    return "jam";
  } else if (clocks.lineup.startTimestamp !== null) {
    return "lineup";
  } else if (clocks.timeout.startTimestamp !== null) {
    return "timeout";
  } else if (clocks.intermission.startTimestamp !== null) {
    return "intermission";
  } else {
    return "stopped";
  }
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