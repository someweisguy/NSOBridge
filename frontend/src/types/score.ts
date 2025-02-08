export type ScoreType = {
  lead: boolean;
  lost: boolean;
  starPass: number | null;
  trips: { timestamp: string; points: number }[];
};
