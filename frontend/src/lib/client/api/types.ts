export type TeamString = "home" | "away";
export type TeamOfficialString = TeamString | "official";
export type StopReasonString = "called" | "time" | "injury" | "other";
export type ClockNameString = keyof Bout["clocks"];

export const HOME = 0;
export const AWAY = 1;

export interface Timer {
  startTimestamp: Date | null;
  elapsed: number;
}

export interface Alarm extends Timer {
  alarm: number;
}

export interface Team {
  roster: {
    name: string;
    mnemonic: string;
  };
  timeouts: number;
  reviews: number;
  scoreOffset: number;
  gameScore: number;
  jamScore: number;
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

export interface Bout {
  id: string;
  rulesetName: string;
  clocks: {
    intermission: Alarm;
    game: Alarm;
    lineup: Alarm;
    jam: Alarm;
  };
  team: Team[];
  timeouts: Timeout[];
  numJams: [number, number, number];
}

export interface JamId {
  period: number;
  jam: number;
}

export interface Trip {
  points: number;
  timestamp: Date;
}
export interface TeamJam {
  lead: boolean;
  lost: boolean;
  starPass: number | null;
  trips: Trip[];
}

export interface Jam extends Timer {
  id: JamId;
  stopReason: StopReasonString | null;
  teamJams: TeamJam[];
}
