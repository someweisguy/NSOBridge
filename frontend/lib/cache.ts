import { CacheKey } from "@/types/query";
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { localSocket } from "./ws";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

/**
 * Invalidate only the parent queries of a cached query.
 *
 * @param key the cache key to invalidate.
 */
export function invalidateCacheParents<T = unknown>(key: CacheKey, data: T) {
  for (let i = key.length - 1; i > 0; --i) {
    // Invalidate super-sets of the stale model
    void queryClient.invalidateQueries(
      {
        queryKey: key.slice(0, i),
        type: "active",
        exact: true,
      },
      { cancelRefetch: false },
    );
  }
  void queryClient.setQueryData(key, data);
}

/**
 * Handle condition in which WebSockets connects to the server. All queries should be
 * invalidated when disconnected.
 */
localSocket.addCallback("connect", (connected: boolean) => {
  onlineManager.setOnline(connected);

  // Invalidate all queries on disconnection
  if (!connected) {
    void queryClient.invalidateQueries();
  }
});

/**
 * Handle cache invalidation packets received from the server.
 */
localSocket.addCallback("cache", ({ models }) => {
  // TODO: use the transactionUUID
  for (const { key, data } of models) {
    invalidateCacheParents(key, data);
  }
});

export default queryClient;
