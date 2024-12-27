import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { JamIdType } from "../types/JamIdType";
import { ScoreType } from "../features/ScoreKeeper/types/ScoreType";
import { keyFactory } from "../utils/keyFactory";

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
