import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { QueryOptions, SuspenseQueryOptions } from "@/types/hooks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseRuleset = (
  bout: Bout,
  options?: SuspenseQueryOptions<Ruleset>,
) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });

export const useRuleset = <T = null>(
  bout: Bout,
  options?: QueryOptions<Ruleset | T>,
) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });
