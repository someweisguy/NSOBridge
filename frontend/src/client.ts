import {
  onlineManager, QueryClient, useMutation, useQuery, useSuspenseQuery
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { v4 as uuid4 } from 'uuid';

interface queryId {
  boutId: string,
  periodId?: number,
  jamId?: number
};

const client = new QueryClient();
const ackResolutions: Map<string, [(msg: object) => void,
  (msg: { title: string, details: string }) => void]> = new Map();
const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');
const latencyIterations: number = 5;

socket.onopen = () => {
  onlineManager.setOnline(true);
  client.refetchQueries();
}

socket.onclose = () => {
  onlineManager.setOnline(false);
  ackResolutions.clear();
}

socket.onmessage = (event: MessageEvent) => {
  const message: {
    type: string,
    action: string,
    transactionId?: string,
    error?: { title: string, details: string },
    id?: { boutId: string, periodId: number, jamId: number },
    data: object
  } = JSON.parse(event.data);

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

export function useOnlineState() {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((onlineState) => {
      setIsOnline(onlineState);
    });
  }, []);

  return isOnline;
}

export function useLatency() {
  const { data } = useQuery<number>({
    queryKey: ['latency'], queryFn: async () => {
      let latencySum: number = 0;
      let successes: number = latencyIterations;
      for (let i = 0; i < latencyIterations; i++) {
        let success: boolean = true;

        // Time the round-trip duration of a packet
        const start: number = window.performance.now();
        await new Promise((resolve, reject) => {
          const payload = {
            type: 'info', action: 'get',
            transactionId: uuid4()
          };
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

  return data;
}


export function useGetter(type: string, id?: queryId): object {
  const { data } = useSuspenseQuery({
    queryKey: [type, id], queryFn: () => {
      return new Promise((resolve, reject) => {
        const payload = { type, action: 'get', args: id, transactionId: uuid4() };
        ackResolutions.set(payload.transactionId, [resolve, reject]);
        socket.send(JSON.stringify(payload));
      });
    }
  }, client);

  return <object>data;
}


export function useSetter(type: string, action: string, id?: queryId, args?: object) {
  useMutation({
    mutationFn: () => {
      return new Promise((resolve, reject) => {
        const payload = {
          type, action, args: { ...args, ...id },
          transactionId: uuid4()
        };
        ackResolutions.set(payload.transactionId, [resolve, reject]);
        socket.send(JSON.stringify(payload));
      });
    }
  }, client);
}