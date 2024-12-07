import { BoutIdType } from "../types/BoutIdType";
import { JamIdType } from "../types/JamIdType";

export const keyFactory = {
  series: () => ["series"],
  bout: (boutId: BoutIdType) => ["bout", boutId],
  jam: (boutId: BoutIdType, jamId: JamIdType) => ["jam", boutId, jamId],
  score: (boutId: BoutIdType, jamId: JamIdType, team: "home" | "away") => [
    "score",
    boutId,
    jamId,
    team,
  ],
  clock: (boutId: BoutIdType, type: string) => ["clock", boutId, type],
};
