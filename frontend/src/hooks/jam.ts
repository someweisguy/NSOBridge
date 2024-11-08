import { useEffect, useState } from "react";
import useBout, { BoutType } from "./bout";
import { useGetter } from "./client";

export type JamId = [number, number];

export type TeamType = {
  lead: boolean;
  lost: boolean;
  starPass: number | null;
  trips: { timestamp: string; points: number }[];
  jammer: null;
  blockers: [null, null, null, null];
  noPivot: boolean;
};

export type JamType = {
  startTimestamp: string;
  stopTimestamp: string;
  stopReason: string;
  home: TeamType;
  away: TeamType;
};

export default function useJam(boutId: string, jamId: JamId): JamType {
  return useGetter<JamType>("jam", {
    boutId, jamId
  });
}

function getNextJamId(bout: BoutType, jamId: JamId): JamId | null {
  const [periodNum, jamNum] = jamId;
  if (jamNum >= bout.jams.jamCounts[periodNum] - 1) {
    if (periodNum >= 1 || bout.jams.jamCounts[1] == 0) {
      return null;  // There is no next Jam
    }
    return [1, 0];
  }
  return [periodNum, jamNum + 1];
}

function getPreviousJamId(bout: BoutType, jamId: JamId): JamId | null {
  const [periodNum, jamNum] = jamId;
  if (jamNum == 0) {
    if (periodNum == 0) {
      return null;  // There is no previous Jam
    }
    return [0, bout.jams.jamCounts[0] - 1];
  }
  return [periodNum, jamNum - 1];
}

export function useJamNavigation(boutId: string, jamId: JamId): [JamId | null, JamId | null] {
  const bout: BoutType = useBout(boutId);

  const [nextJamId, setNextJamId] = useState<JamId | null>(
    () => getNextJamId(bout, jamId)
  );

  const [previousJamId, setPreviousJamId] = useState<JamId | null>(
    () => getPreviousJamId(bout, jamId)
  );

  useEffect(() => {
    setNextJamId(getNextJamId(bout, jamId));
    setPreviousJamId(getPreviousJamId(bout, jamId));
  }, [jamId, bout]);

  return [previousJamId, nextJamId];
}
