import logo from './logo.svg';
import './App.css';
import { TeamJamComponent } from './components/JamComponent';

import { io } from 'socket.io-client';

var userId = localStorage.getItem("userId");
export const socket = io(window.location.host, { auth: { token: userId } });
var latency = 0;

export function getLatency() {
  return latency;
}

export async function sendRequest(api, method, kwargs) {
  const payload = {
    method: method,
    kwargs: kwargs,
    user: userId,  // TODO: use promise to await userId assignment
    session: socket.id,
    latency: latency
  };
  return await socket.emitWithAck(api, payload);
}

async function calculateLatency(iterations) {
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
  console.log("Calculated latency: " + latency + "ms");
}

function App() {
  socket.once("userId", (newUserId) => {
    console.log("Got User ID: " + newUserId);
    localStorage.setItem("userId", newUserId);
    userId = newUserId;
  });

  socket.on("connect", async () => {
    console.log("Connected to server as " + socket.id);
    calculateLatency(10);
  });

  // Periodically recalculate the client-server latency
  setInterval(() => calculateLatency(5), 25000);


  return (
    <div className="App">
      <TeamJamComponent team="home" />
    </div>
  );
}

export default App;
