export type JamIdType = [number, number];

export type JamType = {
  start: string | null;
  stop: string | null;
  stopReason: "called" | "time" | "injury" | "other" | null;
};
