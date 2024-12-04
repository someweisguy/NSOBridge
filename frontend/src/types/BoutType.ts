export type BoutType = {
  gameNumber: string;
  gameState: string;
  numJams: [number, number];
  score: {
    home: number;
    away: number;
  };
  roster: {
    home: string;  // TODO
    away: string;  // TODO
  };
};