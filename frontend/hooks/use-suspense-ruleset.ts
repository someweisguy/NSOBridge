import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions, BoutUri } from "@/types/query";
import { Ruleset } from "@/types/ruleset";
import { generateQueryKey } from "@/utils/query";
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
    queryKey: generateQueryKey.ruleset(boutUuid),
    queryFn: () =>
      localAPI.get<Ruleset>("bout/ruleset", {
        query: { boutUuid },
      }),
    ...options,
  });
