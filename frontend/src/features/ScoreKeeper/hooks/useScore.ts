import { useGetter } from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";
import { ScoreType } from "../types/ScoreType";

export default function useScore(boutId: string, jamId: JamIdType, team: string): ScoreType {
  return useGetter<ScoreType>("score", { boutId, jamId, team });
}