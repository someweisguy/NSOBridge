import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../lib/client";
import { ScoreType } from "../types/ScoreType";
import { keyFactory } from "../utils/keyFactory";
import { JamIdType } from "../types/jam";

export default function useScore<T = ScoreType>(
  boutId: string,
  jamId: JamIdType,
  team: "home" | "away",
  selector?: (score: ScoreType) => T
): T {
  const { data } = useSuspenseQuery<ScoreType, unknown, T>({
    queryKey: keyFactory.score(boutId, jamId, team),
    queryFn: () => dispatch("score", "get", { boutId, jamId, team }),
    select: selector,
  });
  return data;
}
