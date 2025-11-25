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
