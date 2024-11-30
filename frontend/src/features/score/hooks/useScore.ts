import { useGetter } from "../../../hooks/client";
import { JamId } from "../../../hooks/jam";
import { ScoreType } from "../types/ScoreType";

export default function useScore(boutId: string, jamId: JamId, team: string): ScoreType {
  return useGetter<ScoreType>("score", { boutId, jamId, team });
}