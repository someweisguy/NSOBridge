import { io } from 'socket.io-client';

var userId = localStorage.getItem("userId");
const socket = io(window.location.host, { auth: { token: userId } });
var latency = 0;

export async function sendRequest(api, payload = {}) {
  payload.latency = getLatency();
  return socket.emitWithAck(api, payload).then((response) => {
    if (response.status === "error") {
      throw Error(response.error.name + ": '" + response.error.message + "'");
    }
    return response.data;
  });
}

export function onEvent(api, callback) {
  socket.on(api, callback);
  return () => socket.off(api, callback);
}

export function getLatency() {
  return latency;
}

export async function calculateLatency(iterations) {
  if (socket.disconnected) {
    return;
  }

  let latencySum = 0;
  for (let i = 0; i < iterations; i++) {
    // Calculate the round-trip latency
    let success = true;
    const start = window.performance.now();
    await socket.timeout(5000).emitWithAck("ping").then(
      null,  // Do nothing on success
      () => { success = false; }
    );
    const stop = window.performance.now();
    if (start > stop) {
      success = false;  // Guard against negative latency value
    }

    if (success) {
      // Add round-trip latency to the accumulator
      latencySum += stop - start;
    } else {
      // Decrement the iterations value for accurate averaging
      iterations--;
    }
  }

  // Compute one-way latency (in milliseconds) using mathematical average
  if (iterations < 1) {
    return;  // Avoid divide-by-zero error
  }
  latency = Math.round((latencySum / iterations) / 2);
  return latency;
}
