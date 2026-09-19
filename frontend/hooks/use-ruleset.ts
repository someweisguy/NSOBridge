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
 * Fetches the desired Ruleset from the server. This hook is a wrapper for call to
 * TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Ruleset.
 */
export const useGetRuleset = <T = null>({
  rulesetName,
  ...options
}: { rulesetName: string } & AppQueryOptions<Ruleset | T>) =>
  useQuery<Ruleset | T>({
    queryKey: rulesetKeys.one(rulesetName),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { rulesetName },
      }),
    ...options,
  });

/**
 * Fetches the desired Ruleset from the server. This hook is a wrapper for call to
 * TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Ruleset.
 */
export const useSuspenseGetRuleset = ({
  rulesetName,
  ...options
}: { rulesetName: string } & AppSuspenseQueryOptions<Ruleset>) =>
  useSuspenseQuery<Ruleset>({
    queryKey: rulesetKeys.one(rulesetName),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { rulesetName },
      }),
    ...options,
  });

/**
 * Gets all the Rulesets from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Rulesets.
 */
export const useSuspenseGetAllRulesets = <T = Ruleset[]>(
  options?: AppSuspenseQueryOptions<Ruleset[], T>,
) =>
  useSuspenseQuery<Ruleset[], Error, T>({
    queryKey: rulesetKeys.all,
    queryFn: () =>
      localAPI
        .get<Ruleset[]>("bout/allRulesets")
        .then((rulesets: Ruleset[]) => {
          // TODO: add all the rulesets to the cache individually
          return rulesets;
        }),
    ...options,
  });

/**
 * Gets all the Rulesets from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useeQuery object containing an array of all Rulesets.
 */
export const useGetAllRulesets = <T = Ruleset[]>(
  options?: AppQueryOptions<Ruleset[], T>,
): UseQueryResult<T, Error> =>
  useQuery<Ruleset[], Error, T>({
    queryKey: rulesetKeys.all,
    queryFn: () =>
      localAPI
        .get<Ruleset[]>("bout/allRulesets")
        .then((rulesets: Ruleset[]) => {
          // TODO: add all the rulesets to the cache individually
          return rulesets.filter((ruleset) => ruleset != null);
        }),
    ...options,
  });
