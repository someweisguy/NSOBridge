import { Ruleset } from "@/lib/game/ruleset";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getRuleset } from "../lib/game/bouts";

export const useSuspenseRuleset = (bout: Bout) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.ruleset),
    queryFn: () => getRuleset(bout.id),
  });
