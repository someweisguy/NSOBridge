import { Ruleset } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getRuleset } from "../lib/game/bouts";

export const useRuleset = (bout: Bout) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.ruleset),
    queryFn: () => getRuleset(bout.id),
  });
