import logo from './logo.svg';
import './App.css';
import { JamComponent } from './components/JamComponent';

import { io } from 'socket.io-client';

var userId = localStorage.getItem("userId");
export const socket = io(window.location.host, { auth: { token: userId } });
var epsilon = 0;

export function getTick() {
  return Math.round(window.performance.now() - epsilon);
}

export async function getEpsilon(iterations) {
  if (iterations == 0) {
    return 0;
  }

  let startTick = 0;
  let serverTick = 0;

  let latencySum = 0;
  for (let i = 0; i < iterations; i++) {
    // Get the client and server ticks
    startTick = window.performance.now();
    serverTick = (await socket.emitWithAck("sync")).tick;
    const stopTick = window.performance.now();
  
    // Calculate the round-trip latency to receive the server tick
    const roundTripLatencyIteration = stopTick - startTick;
    latencySum += roundTripLatencyIteration;
  }
  const roundTripLatency = (latencySum / iterations)

  // Refine the server tick by subtracting one-way latency
  serverTick -= (roundTripLatency / 2);

  return startTick - serverTick;
}

function App() {
  socket.once("userId", (newUserId) => {
    console.log("Got User ID: " + newUserId);
    localStorage.setItem("userId", newUserId);
    userId = newUserId;
  });
  socket.on("connect", async () => {
    epsilon = await getEpsilon(10);
  });


  return (
    <div className="App">
        <JamComponent />
    </div>
  );
}

export default App;
