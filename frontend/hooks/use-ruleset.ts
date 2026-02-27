import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useRuleset = <T = null>(
  boutUuid: string,
  options?: Omit<QueryOptions<Ruleset | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Ruleset | T>({
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
