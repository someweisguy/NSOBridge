export class Series {
  id: number;
  name: string;
  bouts: Bout[];
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

export default class Clock {
  id: number;

  startTimestamp: Date | null;
  elapsed: number;
  alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}

export class Team {
  id: number;
  rosterId: number;
  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}

export class Jam {
  boutId: number;
  period: number;
  num: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  stopReason: string | null;

  teamJams: TeamJam[];

  static generateKey(id: number, period: number, num: number) {
    return ["jams", id, period, num];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
}

export class TeamJam {
  id: number;
  teamId: number;
  events: {
    id: number;
    timestamp: Date;
    lead: boolean;
    lost: boolean;
    passes: number | null;
    starPass: boolean;
  }[];
}

export class Timeout {
  id: number;

  teamId: number | null;
  jamId: number | null;
  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  isReview: boolean;
  details: string;
  result: string;
  retained: boolean;

  static generateKey(boutId: number, index: number) {
    return ["timeouts", boutId, index];
  }
}

export class BoutContext {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}
