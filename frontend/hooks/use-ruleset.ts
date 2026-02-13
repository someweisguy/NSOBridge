import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import {
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const useSuspenseRuleset = (
  bout: Bout,
  options?: Omit<UseSuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });

export const useRuleset = <T = null>(
  bout: Bout,
  options?: Omit<UseQueryOptions<Ruleset | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(bout.rulesetName),
    queryFn: () => getRuleset(bout.uuid),
    ...options,
  });
