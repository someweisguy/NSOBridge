import { io } from 'socket.io-client';
import React, { useSyncExternalStore } from 'react';

var latency = 0;
var latencyIntervalId = null;
var userId = localStorage.getItem("userId");
const socket = io(window.location.host, { auth: { token: userId } });
var allStores = new Map();

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
  return latency;
}

export async function sendRequest(api, payload = {}) {
  payload.latency = latency;
  return socket.emitWithAck(api, payload).then((response) => {
    if (response.status === "error") {
      throw Error("Python " + response.error.name + ": '" +
        response.error.message + "'");
    }
    return response.data;
  });
}

export function onEvent(api, callback) {
  socket.on(api, callback);
  return () => socket.off(api, callback);
}

function getStore(api, args) {
  const key = [api, args].toString();
  if (allStores.has(key)) {
    return allStores.get(key);
  }

  // Declare variables to be used by the store
  var data = null;
  var timeoutId = null;
  var renderCallbacks = [];
  const updateData = (newData) => {
    if (newData.uuid == data?.uuid) {
      data = newData;
      renderCallbacks.forEach(cb => cb());
    }
  }
  const fetchData = () => {  // TODO: move this to store declaration
    sendRequest(api, args).then((newData) => {
      data = newData
      renderCallbacks.forEach(cb => cb());
    });
  }

  // Instantiate a new store object
  const store = {
    isStale: !socket.connected,
    fetchData,
    subscribe(callback) {
      // Add this render callback - this must done first!
      renderCallbacks.concat(callback);

      // Perform first-time setup
      if (renderCallbacks.length == 0) {
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (socket.connected) {
          fetchData();  // TODO: make asynchronous?
        }
        socket.on(api, updateData);
      }

      // Return a function which will unsubscribe this listener
      return () => {
        renderCallbacks = renderCallbacks.filter(cb => cb !== callback);
        if (renderCallbacks.length == 0) {
          // Temporarily cache stores in case they are needed again
          timeoutId = setTimeout(() => {
            socket.off(api, updateData);
            allStores.delete(key);
          }, 10000);
        }
      }
    },

    getSnapshot() {
      return data;
    }
  }
  allStores.set(key, store);

  return store;
}

export function useGenericStore(api, args = {}) {
  const store = getStore(api, args);
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

socket.on("connect", () => {
  // Update client-server latency
  calculateLatency(10);
  latencyIntervalId = setInterval(async () => {
    calculateLatency(10);
  }, 25000);


  // Update all stores
  allStores.forEach(store => {
    if (store.isStale) {
      store.fetchData()
      store.isStale = false;
    }
  });
});

socket.on("disconnect", () => {
  clearInterval(latencyIntervalId);
  allStores.forEach(store => {
    store.isStale = true;
  });
});
