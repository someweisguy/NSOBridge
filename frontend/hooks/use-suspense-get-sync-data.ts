import queryClient from "@/lib/cache";
import { SuspenseQueryOptions } from "@/types/query";
import { SyncData } from "@/types/ws";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSyncData, serverTimeCacheKey } from "../lib/sync";

const REFETCH_INTERVAL = 1000 * 60 * 5;

export const useSuspenseGetSyncData = (
  options?: Omit<
    SuspenseQueryOptions<SyncData>,
    "queryKey" | "queryFn" | "refetchInterval"
  >,
) =>
  useSuspenseQuery<SyncData>(
    {
      queryKey: [serverTimeCacheKey],
      queryFn: () => getSyncData(),
      refetchInterval: REFETCH_INTERVAL,
      ...options,
    },
    queryClient,
  );
