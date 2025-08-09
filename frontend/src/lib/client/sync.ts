import {
  CONNECT_EVENT,
  getServerInfo,
  registerCallback,
  ServerInfoType,
} from "./ws";

const NUM_SYNC_SAMPLES = 5;
const SYNC_INTERVAL_PERIOD = 1000 * 60 * 5;

let timeOffset: number;
let syncIntervalId: NodeJS.Timeout;
let initialSync: Promise<number>;

async function calculateTimeOffset(): Promise<number> {
  // Collect a number of round-trip time samples
  let clientNow: Date;
  let serverNow: Date;
  const syncSamples: number[] = [];
  do {
    const serverInfo: ServerInfoType = await getServerInfo();
    clientNow = new Date();
    serverNow = serverInfo.server;
    syncSamples.push(clientNow.getTime() - serverInfo.process.getTime());
  } while (syncSamples.length < NUM_SYNC_SAMPLES);

  // Calculate the average round-trip time
  const rtt = syncSamples.reduce((acc, val) => acc + val) / syncSamples.length;
  const serverTime = serverNow.getTime() + rtt / 2;

  return serverTime - clientNow.getTime();
}

export async function getServerTime(now?: Date): Promise<Date> {
  if (timeOffset === undefined) {
    initialSync ??= calculateTimeOffset().then(
      (newOffset) => (timeOffset = newOffset)
    );
    await initialSync;
  }
  now ??= new Date();
  return new Date(timeOffset + now.getTime());
}

registerCallback(CONNECT_EVENT, (connected: boolean) => {
  if (!connected) {
    clearInterval(syncIntervalId);
    return;
  }

  initialSync ??= calculateTimeOffset().then(
    (newOffset) => (timeOffset = newOffset)
  );
  syncIntervalId = setInterval(() => {
    void calculateTimeOffset().then((newOffset) => {
      timeOffset = newOffset;
    });
  }, SYNC_INTERVAL_PERIOD);
});
