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

export async function addTrip(boutId: string, jamId: JamId, team: string, points: number): Promise<undefined> {
  return await sendQuery("score", "addTrip", { boutId, jamId, team, points });
}