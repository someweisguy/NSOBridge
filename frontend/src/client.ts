import { useEffect, useState, useSyncExternalStore } from 'react';
import { v4 as uuid4 } from 'uuid';

export interface Id {
  boutId: string,
  periodId?: number,
  jamId?: number,
};

interface Message {
  readonly action: string,
  readonly transactionId?: string,
  readonly serverTimestamp: string,
  readonly error?: { title: string, detail: string },
  readonly id?: Id,
  data: object,
}

const onlineListeners: (() => void)[] = [];
const ackResolutions: Map<string, (msg: Message) => void> = new Map();
const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');

const latencyListeners: (() => void)[] = [];
let latencyIntervalId: number | null = null;
let latency: number = 0;

async function updateLatency(iterations: number): Promise<void> {
  let latencySum: number = 0;
  let successes: number = iterations;
  for (let i = 0; i < iterations; i++) {
    // Calculate the round-trip latency
    let success: boolean = true;
    const start: number = window.performance.now();
    await sendRequest('server', 'updateLatency');
    const stop: number = window.performance.now();
    if (start > stop) {
      success = false;  // Guard against negative latency value
    }

    if (success) {
      latencySum += stop - start;
    } else {
      successes--;
    }
  }

  if (!successes) {
    return;  // Avoid divide-by-zero error
  }

  // Compute one-way latency (in milliseconds) using mathematical average
  const oldLatency = latency;
  latency = Math.round((latencySum / successes) / 2);
  if (latency != oldLatency) {
    latencyListeners.forEach(cb => cb());
  }
}

socket.addEventListener('open', async () => {
  // Wait for a random delay up to 100ms before starting latency checks
  const randomDelay: number = Math.floor(Math.random() * 100);
  await new Promise<void>(resolve => setTimeout(resolve, randomDelay));

  // Get the socket latency and perform periodic updates
  updateLatency(5);
  latencyIntervalId = setInterval(() => updateLatency(5), 15000);

  // Update all online listeners
  onlineListeners.forEach(cb => cb());

  // FIXME: Temporary test code
  sendRequest('series', 'get').then((series) => {
    console.log(series);
  });
});

socket.addEventListener('close', () => {
  if (latencyIntervalId !== null) {
    clearInterval(latencyIntervalId);
    latencyIntervalId = null;
  }
  ackResolutions.clear();

  // Update all online listeners
  onlineListeners.forEach(cb => cb());
});

socket.addEventListener('message', (event) => {
  const message: Message = JSON.parse(event.data)

  // Check if this message is an ACK to a previous message
  if (message.transactionId) {
    const resolution = ackResolutions.get(message.transactionId);
    if (resolution) {
      ackResolutions.delete(message.transactionId);
      resolution(message);
      return;
    }
  }
});

export function useConnectionStatus() {
  return useSyncExternalStore<boolean>((onStoreChange) => {
    onlineListeners.push(onStoreChange);
    return () => onlineListeners.filter(cb => cb !== onStoreChange);
  }, () => socket.readyState == WebSocket.OPEN);
}

export function useLatency(): number {
  return useSyncExternalStore<number>((onStoreChange) => {
    latencyListeners.push(onStoreChange);
    return () => latencyListeners.filter(cb => cb !== onStoreChange);
  }, () => latency);
}

export async function sendRequest(type: string, action: string,
  args: object = {}): Promise<unknown> {
  const transactionId: string = uuid4();
  socket.send(JSON.stringify({ type, action, args, transactionId }));
  return new Promise<Message>((resolve) => {
    ackResolutions.set(transactionId, resolve);
  }).then((message) => {
    if (message.error) {
      const error: Error = new Error(message.error.detail);
      error.name = message.error.title;
      throw error;
    }
    return message.data;
  });
}

export function useGenericResource(type: string, id: Id): unknown {
  const isConnected = useConnectionStatus();
  const [isPending, setPending] = useState(false);
  const [value, setValue] = useState<unknown>(null);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    sendRequest(type, 'get', id)
      .then((value) => {
        setValue(value);
        setPending(false);
      });
    setPending(true);

  }, [isConnected, type, id])

  if (isPending) {
    throw Promise;
  }

  return value;
}