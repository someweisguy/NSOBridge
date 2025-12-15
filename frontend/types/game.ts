export class Series {
  id: number;
  name: string;
  boutIds: number[];
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
  numTimeouts: number;
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
  boutId: number;
  boutScore: number;
  jamScore: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  scoreOffset: number;
}

export type StopReasonString = "called" | "elapsed" | "injury" | "other";

export class Jam {
  id: number;
  boutId: number;
  period: number;
  num: number;

  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  stopReason: StopReasonString | null;

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

  boutId: number;
  teamId: number | null;
  jamId: number | null;
  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  teamIsOfficials: boolean;
  isReview: boolean;
  details: string;
  result: string;
  retained: boolean;

  static generateKey(boutId: number, index: number) {
    return ["timeouts", boutId, index];
  }

  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
}

export class Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}
