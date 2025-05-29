export type TeamString = "home" | "away";
export type TeamOfficialString = TeamString | "official";
export type StopReasonString = "called" | "time" | "injury" | "other";
export type ClockNameString = keyof Bout["clocks"];

export interface TeamAttribute<T> {
  home: T;
  away: T;
}

export interface Team {
  name: string;
  mnemonic: string;
  score: number;
  clockStops: {
    timeout: number;
    review: number;
  };
}

export interface Timer {
  startTimestamp: Date | null;
  elapsed: number;
}

export interface Alarm extends Timer {
  alarm: number;
}

export interface Timeout extends Timer {
  periodNum: number;
  jamNum: number;
  periodClockElapsed: number;
  isReview: boolean;
  team: TeamOfficialString;
  details: string;
  result: string;
  retained: boolean;
}

export interface Bout extends TeamAttribute<Team> {
  rulesetName: string;
  clocks: {
    intermission: Alarm;
    game: Alarm;
    lineup: Alarm;
    jam: Alarm;
  };
  timeouts: Timeout[];
  numJams: [number, number];
  totalScore: TeamAttribute<number>;
}

export interface Trip {
  points: number;
  timestamp: Date;
}

export interface TeamJam {
  score: {
    lead: boolean;
    lost: boolean;
    starPass: number | null;
    trips: Trip[];
  };
}

export interface Jam {
  startTimestamp: Date | null;
  elapsed: Date | null;
  stopReason: StopReasonString | null;
  home: TeamJam;
  away: TeamJam;
}
