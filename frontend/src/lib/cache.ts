import { onlineManager, QueryClient } from "@tanstack/react-query";
import { APIEvent, ConnectionEvent } from "./client/request";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

window.addEventListener("connection", (event: ConnectionEvent) => {
  onlineManager.setOnline(event.online);
});
window.addEventListener("update", (event: APIEvent) => {
  // Force the query client to refetch the data
  void queryClient.refetchQueries(
    {
      queryKey: event.key,
      type: "active",
      exact: true,
    },
    { cancelRefetch: false }
  );
});
