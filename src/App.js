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
  let latencySum = 0;
  for (let i = 0; i < iterations; i++) {
    // Get the client and server ticks
    let success = true;
    const start = window.performance.now();
    await socket.timeout(5000).emitWithAck("ping", {}).then(
      null,  // Do nothing on success
      () => { success = false; }
    );
    const stop = window.performance.now();

    if (success) {
      // Calculate the round-trip latency to receive the server tick
      const roundTripLatencyIteration = stop - start;
      latencySum += roundTripLatencyIteration;
    } else {
      // Decrement the iterations value for accurate averaging
      iterations--;
    }
  }
  if (iterations === 0) {
    return 0;  // Avoid divide-by-zero error
  }

  const oneWayLatency = Math.round((latencySum / iterations) / 2);
  console.log("Calculated latency: " + oneWayLatency + "ms");

  return oneWayLatency;
}

export async function sendServerData(apiName, data) {
  const payload = { data: data, latency: latency }
  // console.log(payload);
  const response = await socket.emitWithAck(apiName, payload);
  // console.log(response);
  return response;
}

function App() {
  socket.once("userId", (newUserId) => {
    console.log("Got User ID: " + newUserId);
    localStorage.setItem("userId", newUserId);
    userId = newUserId;
  });

  socket.on("connect", async () => {
    console.log("Connected to server as " + socket.id);
    latency = await calculateLatency(10);
  });

  // Calculate the client-server latency
  setInterval(() => {
    latency = calculateLatency(5);
  }, 25000);


  return (
    <div className="App">
      <TeamJamComponent team="home" />
    </div>
  );
}

export default App;
