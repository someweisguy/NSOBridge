import { onlineManager, QueryClient } from "@tanstack/react-query";
import { v4 as uuid4 } from "uuid";

interface APIResponse<T = object> {
  success: boolean;
  data: T;
  timestamp: Date;
}

interface SocketUpdate<T = object> {
  key: unknown[];
  data: T;
  timestamp: Date;
  actor: string | null;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

let timedelta = 0;

const socket: WebSocket = new WebSocket(
  `ws://${window.location.host}/ws/updates`
);
socket.onopen = () => onlineManager.setOnline(true);
socket.onclose = () => onlineManager.setOnline(false);
socket.onmessage = (event: MessageEvent<string>) => {
  const message = JSON.parse(event.data) as SocketUpdate;
  console.log("got ws: ", message);

  // TODO: Update the queryClient with the new data
  // TODO: Manually set updatedAt to the timestamp of the message minus the timedelta
};

export function getClientTimedelta(): number {
  return timedelta;
}

export async function genericRequest<T = object>(
  endpoint: string,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object
): Promise<APIResponse<T>> {
  const response = await fetch(
    `http://${window.location.host}/api/${endpoint}`,
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

async function syncServerTime(): Promise<number> {
  // Configure the API call
  const fetchUrl = `http://${window.location.host}/api/serverSync`;
  const fetchConfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Send the synchronization request
  const start: Date = new Date();
  const response = await fetch(fetchUrl, fetchConfig);
  const stop: Date = new Date();

  // Unpack the response into a JSON object
  const message = (await response.json()) as APIResponse<{
    t1: string; // Server time at receipt of request
    t2: string; // Server time at sending of response
  }>;

  // Compute the time difference between client and server
  // See: https://magewell.com/blog/87/detail
  const t: number[] = [
    start.getTime(),
    new Date(message.data.t1).getTime(),
    new Date(message.data.t2).getTime(),
    stop.getTime(),
  ];
  timedelta = (t[1] - t[0] + (t[3] - t[2])) / 2;

  const round_trip_latency: number = t[3] - t[0] - (t[2] - t[1]);
  return round_trip_latency;
}

// TODO: Below this line can be deleted
// -----------------------------------------------------------------------------

const clientId: string = uuid4();
const transactions = new Map();
let transactionId = 0;

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

export default async function dispatchRequest<T = unknown>(
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
