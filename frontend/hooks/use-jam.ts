import { localAPI } from "@/lib/requests";
import { Jam } from "@/types/jam";
import { AppQueryOptions, JamUri } from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Jam.
 */
export const useJam = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppQueryOptions<Jam>) =>
  useQuery({
    queryKey: generateQueryKey.jam(boutUuid, periodNum, jamNum),
    queryFn: () =>
      localAPI.get<Jam>("jam", {
        query: { boutUuid, periodNum, jamNum },
      }),
    ...options,
  });
