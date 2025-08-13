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
});

registerWebSocketCallback("cache", (keys: object[][]) => {
  for (const key of keys) {
    void queryClient.refetchQueries(
      {
        queryKey: key,
        type: "active",
        exact: true,
      },
      { cancelRefetch: false }
    );
  }
});

export default queryClient;
