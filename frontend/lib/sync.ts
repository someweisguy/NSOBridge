import { ServerData, SyncData } from "@/types/ws";
import Socket, { localSocket } from "./ws";

const NUM_SYNC_SAMPLES = 5;
export const serverTimeCacheKey = "serverTimeCacheKey";

export async function getSyncData(
  socket: Socket = localSocket,
): Promise<SyncData> {
  // Collect a number of round-trip time samples
  let clientNow: Date;
  let lastSyncPacket: ServerData;
  const syncSamples: number[] = [];
  do {
    const info: ServerData = await socket.getServerInfo();
    clientNow = new Date();
    lastSyncPacket = info;
    if (info.process == null) {
      throw new Error(
        "something went wrong when trying to synchronize the server time",
      );
    }
    syncSamples.push(clientNow.getTime() - info.process.getTime());
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
