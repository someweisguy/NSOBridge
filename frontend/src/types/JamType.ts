export type JamType = {
  start: string | null;
  stop: string | null;
  stopReason: "called" | "time" | "injury" | "other" | null;
};