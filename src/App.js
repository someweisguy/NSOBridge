import logo from './logo.svg';
import './App.css';
import { TripComponent } from './components/JamComponent';

import { io } from 'socket.io-client';

var userId = localStorage.getItem("userId");
const socket = io(window.location.host, { auth: { token: userId } });
var latency = 0;

/** A custom hook which requests data when the socket connects, and adds a
 * handler to receive data.
 * 
 * @param {string} api The API function to call.
 * @param {function} callbackFunction The callback which is called to handle 
 * incoming data.
 * @param {object} constArgs The constants which are added as request arguments
 * when the socket connects.
 */
export function useInterface(api, callbackFunction, constArgs) {
  useEffect(
    () => { return addRequestHandler(api, callbackFunction) },
    [api, callbackFunction]
  );

  useEffect(() => {
    return addConnectHandler(async () => {
      const response = await sendRequest(api, constArgs);
      if (!response.error) {
        callbackFunction(response);
      }
    });
  }, [api, constArgs, callbackFunction]);
}

export async function sendRequest(api, payload = {}) {
  payload.latency = latency;
  const response = await socket.emitWithAck(api, payload);
  if (response.error) {
    console.error(api + " returned '" + response.error.name + ": '" +
      response.error.message + "'");
    return null;
  }
  return response.data;
}

export function addRequestHandler(api, callback) {
  ;
}

export function removeRequestHandler(api, callback = null) {
  socket.off(api, callback);
}

export function addConnectHandler(callback) {
  socket.on("connect", callback);
  return () => socket.off("connect", callback);
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
    <div className="App" style={{ display: "flex" }}>
      <TripComponent team="home" />
      <TripComponent team="away" />
    </div>
  );
}

export default App;
