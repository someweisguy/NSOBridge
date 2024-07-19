import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { ScoreboardEditor } from './components/JamComponent';
import { PeriodClock, GameClock } from './components/TimerComponent';

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
  const [isConnected, setIsConnected] = useState(false);
  const [boutUuid, setBoutUuid] = useState(null);

  useEffect(() => {
    socket.once("userId", (newUserId) => {
      console.log("Got User ID: " + newUserId);
      localStorage.setItem("userId", newUserId);
      userId = newUserId;
    });

    socket.on("connect", async () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

  }, []);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Calculate connection latency then get server information
    let ignore = false;
    calculateLatency(10).then(() => {
      sendRequest("getBouts").then((series) => {
        if (ignore) {
          return;  // Ignore old requests
        }

        // If the client already has a Bout UUID, ensure it is valid
        if (boutUuid !== null) {
          let hasValidBout = false;
          for (let bout of series) {
            if (boutUuid === bout.uuid) {
              hasValidBout = true;
              break;
            }
          }

          // Refresh the Bout UUID so data may be reloaded
          if (hasValidBout) {
            let refreshedUuid = boutUuid;
            setBoutUuid(refreshedUuid);
            return;
          }
          setBoutUuid(null);  // Discard invalid Bout UUID
        }

        // Choose an action based on the Bouts available
        if (series.length === 0) {
          // TODO: Go to "Create new Bout"
        } else if (series.length === 1) {
          // Select the only created Bout
          let bout = series[0];
          setBoutUuid(bout.uuid);
        } else {
          // TODO: Go to "Select a Bout"
        }
      })
    });

    // Periodically recalculate the client-server latency
    const intervalId = setInterval(() => calculateLatency(5), 25000);

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, [isConnected]);

  // Show a loading icon if a Bout has not been selected
  if (boutUuid === null) {
    return (
      <></>
    );
  }

  return (
    <div className="App">
      <GameClock boutUuid={boutUuid} />
      &nbsp;
      <PeriodClock boutUuid={boutUuid} />
      <ScoreboardEditor boutUuid={boutUuid} />
    </div>
  );
}

export default App;
