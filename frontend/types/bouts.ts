import Clock from "./clocks";

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

export class BoutContext {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}
