import { v4 as uuid4 } from 'uuid';

const socket = new WebSocket('ws://' + window.location.host + '/ws');
const ackResolutions = new Map();
var latencyIntervalId = null;
var latency = 0;

export async function send(action, args = undefined) {
  const transactionId = uuid4();
  socket.send(JSON.stringify({ action, args, transactionId }));
  return new Promise((resolve) => ackResolutions.set(transactionId, resolve))
    .then((value) => {
      return value;
      // console.log('Got ACK: ' + JSON.stringify(value));
    });
}

async function updateLatency() {
  const start = Date.now();
  await send('updateLatency');
  const stop = Date.now();
  return (stop - start) / 2;
}

socket.addEventListener('open', async (event) => {
  // Wait for a random delay up to 100ms before starting latency checks
  const randomDelay = Math.floor(Math.random() * 100);
  await new Promise(resolve => setTimeout(resolve, randomDelay))

  // Get the socket latency and perform periodic updates
  latency = await updateLatency();
  latencyIntervalId = setInterval(async () => {
    latency = await updateLatency();
  }, 15000);


});

socket.addEventListener('close', (event) => {
  clearInterval(latencyIntervalId);
  latencyIntervalId = null;
  ackResolutions.clear();
});


socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)

  // Check if this message is an ACK to a previous message
  const resolveMessage = ackResolutions.get(message.transactionId);
  if (resolveMessage) {
    ackResolutions.delete(message.transactionId);
    resolveMessage(message.data);
    return;
  }

  // Handle non-ACK message
  // TODO
});
