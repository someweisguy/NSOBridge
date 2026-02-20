import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

// TODO: extract to separate file
export const useSuspenseRuleset = (
  bout: Bout,
  options?: Omit<SuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });

export const useRuleset = <T = null>(
  bout: Bout,
  options?: Omit<QueryOptions<Ruleset | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });
