import { ServerInfoType, SyncDataType } from "../types/ws";
import Socket, { localSocket } from "./ws";

const NUM_SYNC_SAMPLES = 5;

export async function getSyncData(
  socket: Socket = localSocket,
): Promise<SyncDataType> {
  // Collect a number of round-trip time samples
  let clientNow: Date;
  let lastSyncPacket: ServerInfoType;
  const syncSamples: number[] = [];
  do {
    const serverInfo: ServerInfoType = await socket.getServerInfo();
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
