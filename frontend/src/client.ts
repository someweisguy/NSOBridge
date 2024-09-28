import { v4 as uuid4 } from 'uuid';
import { BoutAbstract, getSeries } from './api/series';
import { Bout, getBout } from './api/bout'

const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');
const ackResolutions: Map<string, (msg: Message) => void> = new Map();
let latencyIntervalId: number | null = null;
let latency: number = 0;

export interface Id {
  type?: string,
  boutId: string,
  periodId?: number,
  jamId?: number,
  team?: string
};

interface Message {
  readonly action: string,
  readonly transactionId?: string,
  readonly serverTimestamp: string,
  readonly error?: { title: string, detail: string },
  data: object,
}

export async function send(action: string, args: object = {}): Promise<unknown> {
  const transactionId: string = uuid4();
  socket.send(JSON.stringify({ action, args, transactionId }));
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

export function getLatency(): number {
  return latency;
}

async function updateLatency(iterations: number): Promise<number> {
  let latencySum: number = 0;
  let successes: number = iterations;
  for (let i = 0; i < iterations; i++) {
    // Calculate the round-trip latency
    let success: boolean = true;
    const start: number = window.performance.now();
    await send('updateLatency');
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

  // Compute one-way latency (in milliseconds) using mathematical average
  if (successes < 1) {
    return latency;  // Avoid divide-by-zero error
  }
  return Math.round((latencySum / successes) / 2);
}

socket.addEventListener('open', async () => {
  // Wait for a random delay up to 100ms before starting latency checks
  const randomDelay: number = Math.floor(Math.random() * 100);
  await new Promise<void>(resolve => setTimeout(resolve, randomDelay));

  // Get the socket latency and perform periodic updates
  latency = await updateLatency(5);
  latencyIntervalId = setInterval(async () => {
    latency = await updateLatency(5);
  }, 15000);


  // TODO: this section is just for testing
  const series: [string, BoutAbstract][] = await getSeries();
  if (series.length == 1) {
    const [boutId,] = series[0];
    const bout: Bout = await getBout(boutId);
    console.log(bout);
  } else if (series.length > 1) {
    // TODO
    console.log('There are multiple Bouts available.');
  } else {
    // TODO: create a new Bout
  }


});

socket.addEventListener('close', () => {
  if (latencyIntervalId !== null) {
    clearInterval(latencyIntervalId);
    latencyIntervalId = null;
  }
  ackResolutions.clear();
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

  // Handle non-ACK message
  // TODO
});

interface Store {
  isStale: boolean,
  subscribe: (cb: () => void) => void,
  getSnapshot: () => unknown,
};

const syncStore: Map<string, Map<Id, object>> = new Map()

export function getStore(type: string, id: Id): Store {
  if (!syncStore.has(type)) {
    syncStore.set(type, new Map());
  }
  const stores = <Map<Id, object>>syncStore.get(type);

  if (stores.has(id)) {
    return <Store>stores.get(id);
  }

  let data: unknown | null = null;
  let promise: Promise<unknown> | null = null;
  let renderCallbacks: (() => void)[] = [];

  const store: Store = {
    isStale: true,
    subscribe(cb: () => void): () => void {
      renderCallbacks.push(cb);
      return () => {
        renderCallbacks = renderCallbacks.filter(fn => fn !== cb);
      }
    },
    getSnapshot(): unknown {
      if (!store.isStale) {
        return data;
      }

      if (promise == null) {
        promise = send('get' + type, id)
          .then((newData) => {
            data = newData;
            store.isStale = false;
            promise = null;
            renderCallbacks.forEach(cb => cb());
          });
      }
      throw promise;
    }
  }
  stores.set(id, store);
  return store;
}

