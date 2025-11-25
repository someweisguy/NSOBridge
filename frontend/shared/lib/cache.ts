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

localSocket.registerCallback("connect", (connected: boolean) => {
  onlineManager.setOnline(connected);

  // Invalidate all queries on disconnection
  if (!connected) {
    void queryClient.invalidateQueries();
  }
});

localSocket.registerCallback("cache", (keys: object[][]) => {
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
