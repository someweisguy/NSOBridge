import { v4 as uuid4 } from 'uuid';

const socket: WebSocket = new WebSocket('ws://' + window.location.host + '/ws');
const ackResolutions: Map<string, (msg: Message) => void> = new Map();
let latencyIntervalId: number | null = null;
let latency: number = 0;

interface Message {
  readonly action: string,
  readonly transactionId?: string,
  readonly serverTimestamp: string,
  readonly error?: { title: string, detail: string },
  data: object,
}

export async function send(action: string, args: object = {}): Promise<object> {
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
