import { sendQuery, useGetter } from "./client";
import { JamId } from "./jam";

export type ScoreType = {
  lead: boolean;
  lost: boolean;
  starPass: number | null;
  trips: { timestamp: string; points: number }[];
};

export default function useScore(boutId: string, jamId: JamId, team: string): ScoreType {
  return useGetter<ScoreType>("score", { boutId, jamId, team });
}

export async function setTrip(boutId: string, jamId: JamId, team: string,
  tripId: number, points: number): Promise<null> {
  return await sendQuery<null>("score", "setTrip",
    { boutId, jamId, team, tripId, points }
  );
}

export async function deleteTrip(boutId: string, jamId: JamId, team: string, tripId: number): Promise<null> {
  return await sendQuery<null>("score", "deleteTrip",
    { boutId, jamId, team, tripId }
  );
}

export async function setLead(boutId: string, jamId: JamId, team: string,
  lead: boolean): Promise<null> {
  return await sendQuery<null>("score", "setLead",
    { boutId, jamId, team, lead }
  );
}
