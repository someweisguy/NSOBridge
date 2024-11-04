import { useGetter } from "./client";

export type TeamType = {
  lead: boolean;
  lost: boolean;
  starPas: number | null;
  trips: { timestamp: string; points: number }[];
  jammer: null;
  blockers: [null, null, null, null];
  noPivot: boolean;
}

export type JamType = {
  startTimestamp: string;
  stopTimestamp: string;
  stopReason: string;
  home: TeamType;
  away: TeamType;
}

export default function useJam(boutId: string, periodId: number,
  jamId: number): JamType {
  return useGetter<JamType>("jam", { boutId, periodId, jamId });
}
