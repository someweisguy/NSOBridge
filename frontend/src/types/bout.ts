export type BoutIdType = string;

export type BoutType = {
  gameNumber: string;
  scoreState: "live" | "unofficial" | "final";
  playState: "stopped" | "jam" | "lineup" | "timeout";
  numJams: [number, number];
  isOvertime: boolean;
  timeoutsRemaining: {
    home: number;
    away: number;
  };
  officialReviewsRemaining: {
    home: number;
    away: number;
  };
  score: {
    home: number;
    away: number;
  };
  roster: {
    home: string; // TODO
    away: string; // TODO
  };
};
