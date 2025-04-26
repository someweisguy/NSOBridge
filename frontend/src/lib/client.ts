import { onlineManager, QueryClient } from "@tanstack/react-query";
import adjustServerTime from "./sync";

export interface APIResponse<T = object> {
  success: boolean;
  data: T;
  timestamp: Date;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

export default async function genericRequest<T = object>(
  endpoint: `/${string}`,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object
): Promise<APIResponse<T>> {
  const response = await fetch(
    `http://${window.location.host}/api${endpoint}`,
    {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    }
  );
  return (await response.json()) as APIResponse<T>;
}

const socket: WebSocket = new WebSocket(
  `ws://${window.location.host}/ws/updates`
);
socket.onopen = () => onlineManager.setOnline(true);
socket.onclose = () => onlineManager.setOnline(false);
socket.onmessage = (event: MessageEvent<string>) => {
  const updates = JSON.parse(event.data) as {
    key: unknown[];
    data: object;
    timestamp: Date;
    actor: string | null;
  }[];

  for (const update of updates) {
    console.log("WS: ", update);

    // Update the query cache with the new data
    queryClient.setQueryData(update.key, update.data, {
      updatedAt: adjustServerTime(update.timestamp).getTime(),
    });
  }
};
