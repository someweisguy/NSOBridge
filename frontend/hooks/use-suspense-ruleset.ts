import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseRuleset = (
  bout: Bout,
  options?: Omit<SuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });
