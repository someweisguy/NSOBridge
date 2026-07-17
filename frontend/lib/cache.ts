import { onlineManager, QueryClient } from "@tanstack/react-query";
import { localAPI } from "./requests";
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
export function invalidateCacheParents(key: readonly unknown[]) {
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
localSocket.addCallback("cache", ({ models, transactionUuid }) => {
  if (localAPI.recentTransactionUuids.has(transactionUuid)) {
    // This cache update has already been handled by the HTTP handler
    return;
  }

  localAPI.recentTransactionUuids.add(transactionUuid);
  setTimeout(() => {
    // The transaction UUID will automatically be removed after 5 seconds
    localAPI.recentTransactionUuids.delete(transactionUuid);
  }, 5000);
  for (const { key, data } of models) {
    invalidateCacheParents(key);
    void queryClient.setQueryData(key, data);
  }
});

export default queryClient;
