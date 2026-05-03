import { localAPI } from "@/lib/requests";
import { Jam } from "@/types/jam";
import { AppSuspenseQueryOptions, JamUri } from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Jam.
 */
export const useSuspenseJam = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppSuspenseQueryOptions<Jam>) =>
  useSuspenseQuery<Jam>({
    queryKey: generateQueryKey.jam(boutUuid, periodNum, jamNum),
    queryFn: () =>
      localAPI.get<Jam>("jam", {
        query: { boutUuid, periodNum, jamNum },
      }),
    ...options,
  });
