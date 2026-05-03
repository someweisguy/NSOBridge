import { localAPI } from "@/lib/requests";
import { AppQueryOptions, TimeoutUri } from "@/types/query";
import { Timeout } from "@/types/timeout";
import { generateQueryKey } from "@/utils/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Timeout.
 */
export const useTimeout = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & AppQueryOptions<Partial<Timeout>>) =>
  useQuery({
    queryKey: generateQueryKey.timeout(boutUuid, timeoutNum),
    queryFn: () =>
      localAPI.get<Partial<Timeout>>("timeout", {
        query: { boutUuid, num: timeoutNum }, // TODO: fix alias
      }),
    select: (data) => Object.assign(new Timeout(), data),
    ...options,
  });
