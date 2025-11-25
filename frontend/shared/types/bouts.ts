import Clock from "./clocks";

// type DateToString<T> = T extends Date
//   ? string
//   : T extends object
//   ? { [K in keyof T]: DateToString<T[K]> }
//   : T;

export class Team {
  id: number;
  rosterId: number;
  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}

export class Bout {
  id: number;
  ruleset: string;

  startCountdown: Date | null;
  clock: Clock;

  state: "final" | "jam" | "lineup" | "stopped" | "timeout";
  isRunning: boolean;
  isFinal: boolean;
  jamCounts: number[];
  numTimeouts: number[];
  teams: Team[];

  static generateKey(id: number) {
    return ["bouts", id];
  }
}

export type BoutContext = Readonly<{
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}>;
