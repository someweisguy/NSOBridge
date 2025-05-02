import { onlineManager, QueryClient } from "@tanstack/react-query";
import { APIEvent, ConnectionEvent } from "./client/request";
import adjustServerTime from "./client/sync";

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
  // Update the query cache with the new data
  queryClient.setQueryData(event.key, event.data, {
    updatedAt: adjustServerTime(event.timestamp).getTime(),
  });
});
