import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useRuleset = <T = null>(
  bout: Bout,
  options?: Omit<QueryOptions<Ruleset | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });
