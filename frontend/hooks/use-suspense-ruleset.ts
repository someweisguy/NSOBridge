import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { BoutUri, SuspenseQueryOptions } from "@/types/query";
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
}: BoutUri & Omit<SuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
