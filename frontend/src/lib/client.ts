import { onlineManager, QueryClient } from "@tanstack/react-query";
import { v4 as uuid4 } from "uuid";

type Message<T = object> = {
  event: string;
  data: T;
  objectsChanged: unknown[];
  timestamp: Date;
};

type SyncData = {
  t1: Date;
  t2: Date;
};

let timedelta: number = 0;

export function getClientTimedelta(): number {
  return timedelta;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

let syncIntervalId: NodeJS.Timeout | null = null;
let syncRequestResolution: ((r: Message<SyncData>) => void) | null = null;
const socket: WebSocket = new WebSocket(`ws://${window.location.host}/ws`);

socket.onopen = () => {
  onlineManager.setOnline(true);
  syncIntervalId = setInterval(() => syncServerTime(), 60000);
  syncServerTime();
};

socket.onclose = () => {
  onlineManager.setOnline(false);
  if (syncIntervalId != null) {
    clearInterval(syncIntervalId);
    syncRequestResolution = null;
    syncIntervalId = null;
  }
};

socket.onmessage = (event: MessageEvent<string>) => {
  const message: Message = JSON.parse(event.data);

  // Handle syncResponse messages
  if (message.event === "syncResponse" && syncRequestResolution != null) {
    syncRequestResolution(message as Message<SyncData>);
    syncRequestResolution = null;
    return;
  }

  if (message.event === "objectUpdated") {
    // TODO: handle updates
  }
};

async function syncServerTime(): Promise<number> {
  let timeoutId: NodeJS.Timeout;

  // Send the synchronization request
  const start: Date = new Date();
  const message = await new Promise<Message<SyncData>>((resolve, reject) => {
    syncRequestResolution = resolve;
    socket.send(""); // Intentionally send an empty packet
    timeoutId = setTimeout(() => reject("Request timed out."), 5000);
  }).finally(() => clearTimeout(timeoutId));
  const stop: Date = new Date();

  // Compute the time difference between client and server
  // See: https://magewell.com/blog/87/detail
  const t: Array<number> = [
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
const transactions: Map<number, (ack: Response<unknown>) => void> = new Map();
let transactionId: number = 0;

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
