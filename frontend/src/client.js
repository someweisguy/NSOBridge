import { io } from 'socket.io-client';
import { useEffect, useSyncExternalStore, useState, useDeferredValue } from 'react';

// Client connection variables
var latency = 0;
var latencyIntervalId = null;
var userId = localStorage.getItem("userId");
const socket = io(window.location.host, { auth: { token: userId } });

// External store objects
var isOnline = false;
var onlineListeners = [];
var serverStores = new Map();

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
  const key = [api, JSON.stringify(args)].toString();
  if (serverStores.has(key)) {
    return serverStores.get(key);
  }

  // Declare variables to be used by the store
  var data = null;
  var promise = null;
  var timeoutId = null;
  var renderCallbacks = [];
  const updateData = (newData) => {
    if (newData.uuid == data?.uuid) {
      data = newData;
      renderCallbacks.forEach(cb => cb());
    }
  }

  // Instantiate a new store object
  const store = {
    isStale: true,
    isPending: false,
    subscribe(callback) {
      // Add this render callback - this must done first!
      renderCallbacks.push(callback);

      // Perform first-time setup
      if (renderCallbacks.length == 1) {
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
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
            serverStores.delete(key);
            timeoutId = null;
          }, 10000);
        }
      }
    },
    getSnapshot() {
      if (store.isStale) {
        if (promise == null) {
          store.isPending = true;
          promise = sendRequest(api, args)
            .then((newData) => data = newData)
            .then(() => {
              store.isStale = false;
              store.isPending = false;
              promise = null;
            })
            .then(() => renderCallbacks.forEach(cb => cb()));
        }
        throw promise;
      }
      return data;
    }
  }
  serverStores.set(key, store);

  return store;
}

export default function useGenericStore(api, args = {}) {
  const [store, setStore] = useState(getStore(api, args));
  const deferredStore = useDeferredValue(store);

  useEffect(() => {
    setStore(getStore(api, args));
  }, [api, args])

  return useSyncExternalStore(deferredStore.subscribe, 
    deferredStore.getSnapshot);
}

export function useOnlineListener() {
  return useSyncExternalStore((callback) => {
    onlineListeners.push(callback);
    return () => {
      onlineListeners = onlineListeners.filter(cb => cb !== callback);
    }
  }, () => isOnline);
}

export function getLatency() {
  return latency;
}

async function calculateLatency(iterations) {
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
  return Math.round((latencySum / iterations) / 2);
}

socket.on("connect", async () => {
  // Update client-server latency
  calculateLatency(10).then(newLatency => latency = newLatency);
  latencyIntervalId = setInterval(async () => {
    latency = await calculateLatency(10);
  }, 25000);

  // Update all stores
  serverStores.forEach(store => {
    if (store.isStale && !store.isPending) {
      store.getSnapshot();
    }
  });

  // Update online listeners
  isOnline = true;
  onlineListeners.forEach(cb => cb());
});

socket.on("disconnect", () => {
  clearInterval(latencyIntervalId);

  // Flag stores as stale
  serverStores.forEach(store => store.isStale = true);

  // Update online listeners
  isOnline = false;
  onlineListeners.forEach(cb => cb());
});
