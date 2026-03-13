import queryClient from "@/lib/cache";
import { localSocket, serverTimeCacheKey } from "@/lib/ws";
import { AppSuspenseQueryOptions } from "@/types/query";
import { SyncData } from "@/types/ws";
import { useSuspenseQuery } from "@tanstack/react-query";

// The interval in milliseconds at which the sync data is refreshed.
const REFETCH_INTERVAL = 1000 * 60 * 5;

/**
 * Compute and fetch the server-client network latency and error in milliseconds. This
 * value is recomputed every 5 minutes by default. This hook is used to ensure that
 * clock values are synchronized between clients.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Bouts.
 */
export const useSuspenseGetSyncData = (
  options?: AppSuspenseQueryOptions<SyncData>,
) =>
  useSuspenseQuery<SyncData>(
    {
      queryKey: serverTimeCacheKey,
      queryFn: () => localSocket.getSyncData(),
      refetchInterval: REFETCH_INTERVAL,
      ...options,
    },
    queryClient,
  );
