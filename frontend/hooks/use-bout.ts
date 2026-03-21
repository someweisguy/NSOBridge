import { Bout } from "@/lib/game/bouts";
import { localAPI } from "@/lib/requests";
import { AppQueryOptions, BoutUri } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Bout.
 */
export const useBout = ({
  boutUuid,
  ...options
}: BoutUri & AppQueryOptions<Partial<Bout>>) =>
  useQuery<Partial<Bout>, Error, Bout>({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () => localAPI.get("bout", { query: { boutUuid } }),
    select: (data) => Object.assign(new Bout(), data),
    ...options,
  });
