export type BoutIdType = string;

export type BoutType = {
  gameNumber: string;
  scoreState: "live" | "unofficial" | "final";
  playState: "stopped" | "jam" | "lineup" | "timeout";
  numJams: [number, number];
  isOvertime: boolean;
  score: {
    home: number;
    away: number;
  };
  roster: {
    home: string; // TODO
    away: string; // TODO
  };
};
