import { onlineManager } from "@tanstack/react-query";
import { queryClient } from "./client";
import getServerTimedelta from "./sync";

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

  const timedelta: number = getServerTimedelta();
  for (const update of updates) {
    console.log("WS: ", update);

    // Update the query cache with the new data
    queryClient.setQueryData(update.key, update.data, {
      updatedAt: new Date(update.timestamp).getTime() + timedelta,
    });
  }
};
