import genericRequest from "../request";
import adjustServerTime from "../sync";

export type JamStopReasons = ["called", "time", "injury", "other"];

export interface TeamJam {
  score: {
    lead: boolean;
    lost: boolean;
    starPass: number | null;
    trips: { points: number; timestamp: Date }[];
  };
}

export interface Jam {
  start: Date | null;
  stop: Date | null;
  stopReason: JamStopReasons | null;
  home: TeamJam;
  away: TeamJam;
}

export async function getJam(
  boutId: string,
  periodNum: number,
  jamNum: number
): Promise<Jam> {
  const response = await genericRequest<Jam>("/jam", "GET", {
    bout_id: boutId,
    period_num: periodNum,
    jam_num: jamNum,
  });
  const jam: Jam = response.data;

  // Adjust Jam start/stop times to local time
  for (let clock of [jam.start, jam.stop]) {
    if (clock !== null) {
      clock = adjustServerTime(clock);
    }
  }

  // Adjust Trip timestamps to local time
  for (const trips of [jam.home.score.trips, jam.away.score.trips]) {
    for (let trip of trips) {
      trip.timestamp = adjustServerTime(trip.timestamp);
    }
  }

  return jam;
}
