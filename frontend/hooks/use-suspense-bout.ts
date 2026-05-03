import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppSuspenseQueryOptions, BoutUri } from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Bout.
 */
export const useSuspenseBout = ({
  boutUuid,
  ...options
}: BoutUri & AppSuspenseQueryOptions<Bout>) =>
  useSuspenseQuery<Bout>({
    queryKey: generateQueryKey.bout(boutUuid),
    queryFn: () =>
      localAPI.get<Bout>("bout", {
        query: { boutUuid },
      }),
    ...options,
  });
