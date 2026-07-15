import { localAPI } from "@/lib/requests";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  BoutUri,
} from "@/types/query";
import { Ruleset } from "@/types/ruleset";
import { rulesetKeys } from "@/utils/query-keys";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Ruleset from the server. This hook is a wrapper for call to
 * TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Ruleset.
 */
export const useRuleset = <T = null>({
  boutUuid,
  ...options
}: BoutUri & AppQueryOptions<Ruleset | T>) =>
  useQuery<Ruleset | T>({
    queryKey: rulesetKeys.one(boutUuid),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { boutUuid },
      }),
    ...options,
  });

/**
 * Fetches the desired Ruleset from the server. This hook is a wrapper for call to
 * TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Ruleset.
 */
export const useSuspenseRuleset = ({
  boutUuid,
  ...options
}: BoutUri & AppSuspenseQueryOptions<Ruleset>) =>
  useSuspenseQuery<Ruleset>({
    queryKey: rulesetKeys.one(boutUuid),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { boutUuid },
      }),
    ...options,
  });
