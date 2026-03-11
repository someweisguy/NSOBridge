import { Bout, getBout } from "@/lib/game/bouts";
import { BoutUri, AppSuspenseQueryOptions } from "@/types/query";
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
  useSuspenseQuery({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () => getBout(boutUuid),
    ...options,
  });
