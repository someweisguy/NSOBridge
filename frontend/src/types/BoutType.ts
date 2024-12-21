import { GameStates } from "./GameStates";

export type BoutType = {
  gameNumber: string;
  gameState: GameStates;
  numJams: [number, number];
  score: {
    home: number;
    away: number;
  };
  roster: {
    home: string; // TODO
    away: string; // TODO
  };
};
