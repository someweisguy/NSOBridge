import { io } from 'socket.io-client';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Clock constants
export const PERIOD_CLOCK = "period";
export const INTERMISSION_CLOCK = "intermission";
export const LINEUP_CLOCK = "lineup";
export const JAM_CLOCK = "jam";
export const TIMEOUT_CLOCK = "timeout";
export const GAME_CLOCK = "game";

// Client connection variables
var latency = 0;
var latencyIntervalId = null;
const socket = io(window.location.host, { auth: { token: userId } });

// External store objects
var isOnline = false;
var onlineListeners = [];
var userId = localStorage.getItem("userId");
var serverStores = new Map();

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
  if (serverStores.has(key)) {
    return serverStores.get(key);
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

  // Instantiate a new store object
  const store = {
    isStale: true,
    subscribe(callback) {
      // Add this render callback - this must done first!
      renderCallbacks.push(callback);

      // Perform first-time setup
      if (renderCallbacks.length == 1) {
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (socket.connected) {
          store.getSnapshot();  // TODO: make asynchronous?
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
          }, 10000);
        }
      }
    },
    getSnapshot() {
      if (store.isStale) {
        sendRequest(api, args).then((newData) => {
          data = newData;
          renderCallbacks.forEach(cb => cb());
        });
        store.isStale = false;
      }
      return data;
    }
  }
  serverStores.set(key, store);

  return store;
}

export function useGenericStore(api, args = {}) {
  const store = getStore(api, args);
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useOnlineListner() {
  return useSyncExternalStore((callback) => {
    onlineListeners.push(callback);
    return () => {
      onlineListeners = onlineListeners.filter(cb => cb !== callback);
    }
  }, () => isOnline);
}

socket.on("connect", () => {
  // Update client-server latency
  calculateLatency(10);
  latencyIntervalId = setInterval(async () => {
    calculateLatency(10);
  }, 25000);

  // Update all stores
  serverStores.forEach(store => store.getSnapshot());

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

export function useClock(bout, virtualType, stopAtZero = true) {
  const [lap, setLap] = useState(0);
  const [clock, setClock] = useState(null);
  const [type, setType] = useState(null);

  // Determine which clock to use
  useEffect(() => {
    if (bout == null) {
      return;
    }

    // Translate virtual clock types
    let concreteType = virtualType;
    if (concreteType == GAME_CLOCK) {
      if (bout.clocks.timeout.running) {
        concreteType = TIMEOUT_CLOCK;
      } else if (bout.clocks.lineup.running) {
        concreteType = LINEUP_CLOCK;
      } else {
        concreteType = JAM_CLOCK;
      }
    }
    if (!Object.hasOwn(bout.clocks, concreteType)) {
      throw Error("unknown clock type");
    }

    // Set the new clock and set the initial lap
    const newClock = bout.clocks[concreteType];
    setClock(newClock);
    setLap(0);

    // Update the clock type
    if (concreteType != type) {
      setType(concreteType);
    }
  }, [bout, virtualType]);

  // Update the clock if it is running
  useEffect(() => {
    if (clock == null || !clock.running) {
      return;
    }

    const lastUpdate = Date.now() - latency;

    const intervalId = setInterval(() => {
      const newLap = Date.now() - lastUpdate;
      if (stopAtZero && clock.alarm != null
        && clock.elapsed + newLap >= clock.alarm) {
        clearInterval(intervalId);
      }
      setLap(newLap);
    }, 50);

    return () => clearInterval(intervalId);
  }, [clock, stopAtZero]);

  // Render the number of milliseconds elapsed/remaining
  let elapsed = 0;
  let remaining = null;
  if (clock != null) {
    elapsed = clock.elapsed;
    if (clock.running) {
      elapsed += lap;
    }
    if (clock.alarm != null) {
      remaining = clock.alarm - elapsed;
      if (stopAtZero && remaining < 0) {
        remaining = 0;
      }
    }
  }

  return { elapsed, remaining, alarm: clock?.alarm, type };
}
