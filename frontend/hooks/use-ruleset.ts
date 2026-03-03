import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { BoutUri, QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useRuleset = <T = null>({
  boutUuid,
  ...options
}: BoutUri & Omit<QueryOptions<Ruleset | T>, "queryKey" | "queryFn">) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
