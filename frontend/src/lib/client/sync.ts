import {
  CONNECT_EVENT,
  getServerInfo,
  registerCallback,
  ServerInfoType,
} from "./ws";

const NUM_SYNC_SAMPLES = 5;
const SYNC_INTERVAL_PERIOD = 1000 * 60 * 5;

let syncData: { offset: number; error: number };
let syncIntervalId: NodeJS.Timeout;
let initialSync: Promise<typeof syncData>;

async function calculateSyncData(): Promise<typeof syncData> {
  // Collect a number of round-trip time samples
  let clientNow: Date;
  let lastSyncPacket: ServerInfoType;
  const syncSamples: number[] = [];
  do {
    const serverInfo: ServerInfoType = await getServerInfo();
    clientNow = new Date();
    syncSamples.push(clientNow.getTime() - serverInfo.process.getTime());
    lastSyncPacket = serverInfo;
  } while (syncSamples.length < NUM_SYNC_SAMPLES);

  // Calculate the average round-trip time
  const rtt = syncSamples.reduce((acc, val) => acc + val) / syncSamples.length;
  const serverTime = lastSyncPacket.server.getTime() + rtt / 2;

  return {
    offset: serverTime - clientNow.getTime(),
    error: rtt / 2,
  };
}

export async function getSyncData(): Promise<typeof syncData> {
  if (syncData === undefined) {
    initialSync ??= calculateSyncData().then((newSync) => (syncData = newSync));
    await initialSync;
  }
  return syncData;
}

export async function getServerTime(now?: Date): Promise<Date> {
  const sync = await getSyncData();
  now ??= new Date();
  return new Date(sync.offset + now.getTime());
}

registerCallback(CONNECT_EVENT, (connected: boolean) => {
  if (!connected) {
    clearInterval(syncIntervalId);
    return;
  }

  let previousSyncComplete = false;
  void calculateSyncData().then((newSync) => {
    previousSyncComplete = true;
    syncData = newSync;
  });
  syncIntervalId = setInterval(() => {
    if (previousSyncComplete) {
      previousSyncComplete = false;
      void calculateSyncData().then((newSync) => {
        previousSyncComplete = true;
        syncData = newSync;
      });
    }
  }, SYNC_INTERVAL_PERIOD);
});
