import { io } from 'socket.io-client';
import React from 'react';

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

export function useBout(boutUuid) {
  const [bout, setBout] = React.useState(null);

  React.useEffect(() => {
    if (boutUuid === null) {
      return;
    }

    const uri = { bout: boutUuid }
    sendRequest("bout", { uri }).then((newBout) => {
      setBout(newBout);
    });
  }, [boutUuid]);

  React.useEffect(() => {
    const unsubscribe = onEvent("bout", (newBout) => {
      setBout(newBout);
    })

    return unsubscribe;
  }, []);


  return bout;
}

export function useJam(boutUuid, periodNum, jamNum) {
  const [jam, setJam] = React.useState(null);

  React.useEffect(() => {
    if (boutUuid === null || periodNum === null || jamNum === null) {
      return;
    }
    
    const uri = { bout: boutUuid, period: periodNum, jam: jamNum };
    sendRequest("jam", { uri }).then((newJam) => {
      setJam(newJam);
    });
    
  }, [boutUuid, periodNum, jamNum]);
  
  let ignore = false;
  React.useEffect(() => {
    if (jam === null) {
      return;
    }

    const unsubscribe = onEvent("jam", (newJam) => {
      if (!ignore && newJam.uuid == jam.uuid) {
        setJam(newJam);
      }
    })

    return () => {
      ignore = true;
      unsubscribe()
    };
  }, [jam])


  return jam;
}