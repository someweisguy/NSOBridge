import { onlineManager, QueryClient } from "@tanstack/react-query";
import { v4 as uuid4 } from "uuid";

type Response<T = unknown> =
  | {
      clientId: string;
      transactionId: number;
      result: "ok";
      data: T;
    }
  | {
      clientId: string;
      transactionId: number;
      result: "error";
      data: { title: string; detail: string };
    };

type Message = {
  type: string;
  id: unknown[];
  data: unknown;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

const clientId: string = uuid4();
const socket: WebSocket = new WebSocket("ws://" + window.location.host + "/ws");
const transactions: Map<number, (ack: Response<unknown>) => void> = new Map();
let transactionId: number = 0;

socket.onopen = () => {
  onlineManager.setOnline(true);
};

socket.onclose = () => {
  onlineManager.setOnline(false);
  transactions.clear();
};

socket.onmessage = (event: MessageEvent<string>) => {
  const message: Response<unknown> | Message[] = JSON.parse(event.data);

  // Handle server responses
  if ("clientId" in message) {
    if (message.clientId !== clientId) {
      return; // The message is not for this client
    } else if (!transactions.has(message.transactionId)) {
      throw Error("Unknown transaction ID: " + message.transactionId);
    }

    // Resolve the transaction
    const resolve = transactions.get(message.transactionId!)!;
    resolve(message);
    return;
  }

  // Handle server notifications
  for (const notification of message) {
    const queryKey =
      notification.id != null && notification.id.constructor == Array
        ? [notification.type, ...notification.id]
        : [notification.type, notification.id];
    queryClient.setQueryData(queryKey, notification.data);
  }
};

export default async function dispatch<T = unknown>(
  module: string,
  method: string,
  args: object = {}
) {
  const response: Response<unknown> = await new Promise((resolve) => {
    const payload = { module, method, args, clientId, transactionId };
    transactions.set(payload.transactionId, resolve);
    socket.send(JSON.stringify(payload));
    transactionId++;
  });
  transactions.delete(response.transactionId);

  if (response.result == "error") {
    throw new Error(
      "Server " + response.data.title + ": " + response.data.detail
    );
  }

  return response.data as T;
}
