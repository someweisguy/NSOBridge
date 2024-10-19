import {
  onlineManager, QueryClient, useQuery, useSuspenseQuery
} from "@tanstack/react-query";
import { v4 as uuid4 } from 'uuid';

interface Message {
  readonly type: string,
  readonly action: string,
  readonly transactionId?: string,
  readonly error?: ErrorMessage,
  readonly id?: { boutId: string, periodId?: number, jamId?: number },
  data: object,
}

interface ErrorMessage {
  title: string,
  detail: string
}


export function useRequest(type: string, id?: {
  boutId: string,
  periodId?: number,
  jamId: number
}) {
  return useSuspenseQuery({
    queryKey: [type, id], queryFn: () => {
      return new Promise((resolve, reject) => {
        const payload = { type, action: 'get', args: id, transactionId: uuid4() };
        ackResolutions.set(payload.transactionId, [resolve, reject]);
        socket.send(JSON.stringify(payload));
      })
    }
  })
}

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const payload = {
          type: queryKey[0],
          action: 'get',
          args: queryKey[1],
          transactionId: uuid4()
        };

        return new Promise((resolve, reject) => {
          ackResolutions.set(payload.transactionId, [resolve, reject]);
        });
      },
    }

  }
});


const ackResolutions: Map<string, [(msg: object) => void,
  (msg: ErrorMessage) => void]> = new Map();
const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');

socket.onopen = () => {
  onlineManager.setOnline(true);
}

socket.onclose = () => {
  onlineManager.setOnline(false);
  ackResolutions.clear();
}

socket.onmessage = (event: MessageEvent) => {
  const message: Message = JSON.parse(event.data);

  // Check if this message is an ACK to a previous message
  if (message.transactionId) {
    const functions = ackResolutions.get(message.transactionId);
    if (functions) {
      const [resolve, reject] = functions;
      if (!message.error) {
        resolve(message.data);
      } else {
        reject(message.error)
      }
      return;
    }
  }

  // Update data state if no errors exist
  if (!message.error) {
    client.setQueryData([message.type, message.id], () => message.data);
  }
}

export function useConnectionStatus() {
  return onlineManager.isOnline();  // TODO: validate this works
}

export function useLatency() {
  return useQuery<number>({
    queryKey: ['serverLatency'], queryFn: async () => {
      const iterations: number = 5;

      let latencySum: number = 0;
      let successes: number = iterations;
      for (let i = 0; i < iterations; i++) {
        let success: boolean = true;

        // Time the round-trip duration of a packet
        const start: number = window.performance.now();
        await new Promise((resolve, reject) => {
          const payload = { action: 'getLatency', transactionId: uuid4() };
          ackResolutions.set(payload.transactionId, [resolve, reject]);
          socket.send(JSON.stringify(payload));
        }).catch(() => success = false);
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
}