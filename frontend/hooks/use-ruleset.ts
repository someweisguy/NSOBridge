import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { BoutUri, AppQueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

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
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
