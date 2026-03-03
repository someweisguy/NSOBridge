import { Bout, getBout } from "@/lib/game/bouts";
import { BoutUri, QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Bout.
 */
export const useBout = <T = null>({
  boutUuid,
  ...options
}: BoutUri & Omit<QueryOptions<Bout | T>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () => getBout(boutUuid),
    ...options,
  });
