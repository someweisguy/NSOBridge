import { Ruleset } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getRuleset } from "../lib/game/bouts";

export const useRuleset = (seriesId: number, key: number) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Bout.generateKey(seriesId, key).concat("context"),
    queryFn: () => getRuleset(key),
  });
