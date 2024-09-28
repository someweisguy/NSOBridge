import { Id, send } from "../client";

interface Team {
  lead: boolean;
  lost: boolean;
  starPas: number | null;
  trips: { timestamp: string; points: number }[];
  jammer: null;
  blockser: [null, null, null, null];
  noPivot: boolean;
}

interface Jam {
  startTimestamp: string;
  stopTimestamp: string;
  stopReason: string;
  home: Team;
  away: Team;
}

const jams: Map<Id, Jam> = new Map();


export async function getJam(boutId: string, periodId: number,
  jamId: number): Promise<Jam> {
  const jamKey: Id = { boutId, periodId, jamId };
  if (jams.has(jamKey)) {
    return <Jam>jams.get(jamKey);
  }
  const jam = <Jam>await send("getJam", jamKey);
  jams.set(jamKey, jam);
  return jam;
}
