import { onlineManager, QueryClient } from "@tanstack/react-query";
import { registerWebSocketCallback } from "./ws";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

registerWebSocketCallback("connect", (connected: boolean) => {
  onlineManager.setOnline(connected);

  // Invalidate all queries on disconnection
  if (!connected) {
    void queryClient.invalidateQueries();
  }
});

registerWebSocketCallback("cache", (keys: object[][]) => {
  for (const key of keys) {
    void queryClient.invalidateQueries(
      {
        queryKey: key,
        type: "active",
        exact: true,
      },
      { cancelRefetch: true },
    );
  }
});

export default queryClient;
