import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { BoutUri, AppSuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

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
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
