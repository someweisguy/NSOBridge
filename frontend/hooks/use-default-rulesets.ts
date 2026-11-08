import { localAPI } from "@/lib/requests";
import { AppQueryOptions } from "@/types/query";
import { Ruleset } from "@/types/ruleset";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * Gets all the default Rulesets from the server. This hook is a wrapper for a
 * call to TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useQuery object containing a mapping of Rulesets.
 */
export const useDefaultRulesets = <T = Record<string, Ruleset>[]>(
  options?: AppQueryOptions<Record<string, Ruleset>[], T>,
): UseQueryResult<T, Error> =>
  useQuery<Record<string, Ruleset>[], Error, T>({
    queryKey: ["bouts", "defaultRuleset"],
    queryFn: () =>
      localAPI.get<Record<string, Ruleset>[]>("bout/defaultRuleset"),
    ...options,
  });
