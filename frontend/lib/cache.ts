import { CacheKey } from "@/types/ws";
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
localSocket.addCallback("cache", (keys: CacheKey[]) => {
  for (const key of keys) {
    for (let i = key.length; i > 0; --i) {
      // Invalidate super-sets of the stale model
      void queryClient.invalidateQueries(
        {
          queryKey: key.slice(0, i),
          type: "active",
          exact: true,
        },
        { cancelRefetch: true },
      );
    }
  }
});

export default queryClient;
