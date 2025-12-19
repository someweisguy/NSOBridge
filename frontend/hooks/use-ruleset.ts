import { Ruleset } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getRulesetContext } from "../lib/game/bouts";

export const useRuleset = (key: number) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Bout.generateKey(key).concat("context"),
    queryFn: () => getRulesetContext(key),
  });
