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
      <GameClock />
      &nbsp;
      <PeriodClock />
      <ScoreboardEditor />
    </div>
  );
}

export default App;
