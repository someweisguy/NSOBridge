import { localAPI } from "@/lib/requests";
import { AppQueryOptions, AppSuspenseQueryOptions } from "@/types/query";
import { Ruleset } from "@/types/ruleset";
import { rulesetKeys } from "@/utils/query-keys";
import {
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

/**
 * Fetches the desired Bout Ruleset constants. This hook is a wrapper for call
 * to TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Ruleset.
 */
export const useRuleset = <T = null>({
  uuid,
  ...options
}: { uuid: string } & AppQueryOptions<Ruleset | T>) =>
  useQuery<Ruleset | T>({
    queryKey: rulesetKeys.one(uuid),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { uuid },
      }),
    ...options,
  });

/**
 * Fetches the desired Bout Ruleset constants. This hook is a wrapper for call
 * to TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Ruleset.
 */
export const useSuspenseRuleset = ({
  uuid,
  ...options
}: { uuid: string } & AppSuspenseQueryOptions<Ruleset>) =>
  useSuspenseQuery<Ruleset>({
    queryKey: rulesetKeys.one(uuid),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { uuid },
      }),
    ...options,
  });

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
