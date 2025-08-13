import { getServerInfo, ServerInfoType } from "./ws";

interface SyncDataType {
  offset: number;
  error: number;
}

const NUM_SYNC_SAMPLES = 5;

export async function getSyncData(): Promise<SyncDataType> {
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

export function getServerTime(offset: number, now: Date = new Date()): Date {
  return new Date(offset + now.getTime());
}
