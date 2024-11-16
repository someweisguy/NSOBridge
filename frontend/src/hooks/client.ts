import {
  onlineManager, QueryClient, useQuery, useSuspenseQuery
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { v4 as uuid4 } from 'uuid';

type ServerAck = {
  transactionId: string;
  result: 'ok';
  data: unknown;
};

type ServerNack = {
  transactionId: string;
  result: 'error';
  data: { title: string, details: string }
}

type ServerUpdate = {
  id: unknown;
  type: string;
  data: unknown;
};

const client = new QueryClient();
const ackResolutions: Map<string, (ack: ServerAck | ServerNack) => void> = new Map();
const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');
socket.onopen = () => {
  onlineManager.setOnline(true);
  client.refetchQueries();
}
socket.onclose = () => {
  onlineManager.setOnline(false);
  ackResolutions.clear();
}
socket.onmessage = (event: MessageEvent<string>) => {
  const message: ServerAck | ServerNack | ServerUpdate = JSON.parse(event.data);

  // Handle responses to requests
  if ('transactionId' in message) {
    const resolve = ackResolutions.get(message.transactionId);
    if (resolve) {
      resolve(message);
    }
    return;
  }

  // Handle updates from the server
  client.setQueryData([message.id, message.type], () => message.data);
}

// Get the Bout data from the HTML root
const rootNode: HTMLElement | null = document.getElementById('root');
if (rootNode?.dataset?.model) {
  try {
    client.setQueryData(['series', {}],
      JSON.parse(rootNode.dataset.model));
  } catch {
    console.error("Could not parse data model seed.")
  }
} else {
  console.error('Data model not found in server response.');
}


export async function sendQuery<T = object>(type: string, action: string, args?: object): Promise<T> {
  const response: ServerAck | ServerNack = await new Promise((resolve) => {
    const payload = { module: type, method: action, args, transactionId: uuid4() };
    ackResolutions.set(payload.transactionId, resolve);
    socket.send(JSON.stringify(payload));
  });
  if (response.result == 'error') {
    throw new Error(response.data.details);
  }
  return response.data as T;
}

export function useGetter<T = object>(type: string, args: object = {}): T {
  const { data } = useSuspenseQuery({
    queryKey: [type, args],
    queryFn: () => sendQuery(type, "get", args)
  }, client);
  return data as T;
}

export function useConnection() {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((onlineState) => {
      setIsOnline(onlineState);
    });
  }, []);

  const { data } = useQuery<number>({
    queryKey: ['latency'], queryFn: async () => {
      const latencyIterations: number = 5;
      let latencySum: number = 0;
      let successes: number = latencyIterations;
      for (let i = 0; i < latencyIterations; i++) {
        let success: boolean = true;

        // Time the round-trip duration of a packet
        const start: number = window.performance.now();
        await sendQuery('server', 'latency').catch(() => {
          success = false;
        });
        const stop: number = window.performance.now();

        if (success) {
          latencySum += stop - start;
        } else {
          successes--;
        }
      }

      // Compute one-way latency (in milliseconds) using mathematical average
      return successes > 0 ? Math.round((latencySum / successes) / 2) : 0;
    }, refetchInterval: 10000, initialData: 0,
  }, client);

  return { latency: data, isOnline };
}
