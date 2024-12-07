import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";
import { ScoreType } from "../types/ScoreType";

export default function useScore(boutId: string, jamId: JamIdType, team: "home" | "away"): ScoreType {
  const { data } = useSuspenseQuery<ScoreType>({
    queryKey: ["score", boutId, jamId, team],
    queryFn: () => dispatch("score", "get", { boutId, jamId, team })
  });
  return data;
}