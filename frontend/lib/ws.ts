import { CacheKey, ServerData, SyncData } from "../types/ws";
import { dateReviver } from "../utils/revivers";

type CallbackType<T = unknown> = (data: T) => void;

export const serverTimeCacheKey = ["serverTimeCacheKey"];

/**
 * The number of samples to use when synchronizing time with the server.
 */
const NUM_SYNC_SAMPLES = 5;

interface API {
  cache: CacheKey[];
  connect: boolean;
  about: ServerData;
}

interface WebSocketSchema<K extends keyof API> {
  type: K;
  data: API[K];
}

export default class Socket {
  private ws: WebSocket;
  private allCallbacks = new Map<string, CallbackType[]>();
  private allResolutions = new Map<string, CallbackType[]>();

  private handleEvent<K extends keyof API>(type: K, data: API[K]) {
    for (const callbackMap of [this.allCallbacks, this.allResolutions]) {
      const callbacks = callbackMap.get(type);
      callbacks?.forEach((callback) => callback(data));
    }
  }

  private receiveData<K extends keyof API>(
    type: K,
    timeout = 5000,
  ): Promise<API[K]> {
    return new Promise((resolve, reject) => {
      const resolutions: CallbackType[] = this.allResolutions.get(type) ?? [];

      resolutions.push(resolve as CallbackType);
      this.allResolutions.set(type, resolutions);
      setTimeout(() => reject(new Error("WebSocket timed out")), timeout);
    });
  }

  private connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.handleEvent("connect", true);
    this.ws.onclose = () => {
      this.handleEvent("connect", false);
      setTimeout(() => this.connect(url), 1000);
    };
    this.ws.onerror = () => this.ws.close();
    this.ws.onmessage = <K extends keyof API>(event: MessageEvent<string>) => {
      const { type, data } = JSON.parse(
        event.data,
        dateReviver,
      ) as WebSocketSchema<K>;
      this.handleEvent(type, data);
    };
  }

  constructor(url: string) {
    this.connect(url);
  }

  addCallback<T extends keyof API>(type: T, cb: CallbackType<API[T]>): void {
    const callbacks: CallbackType[] = this.allCallbacks.get(type) ?? [];
    callbacks.push(cb as unknown as CallbackType);

    this.allCallbacks.set(type, callbacks);
  }

  async getServerInfo(): Promise<ServerData> {
    // Wait until the WebSocket is connected
    if (this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.receiveData("connect").catch(() => false);
      if (!connected) {
        throw new Error("Could not get server info (not connected)");
      }
    }

    this.ws.send(JSON.stringify({ process: new Date() }));
    return this.receiveData("about");
  }

  async getSyncData(): Promise<SyncData> {
    // Collect a number of round-trip time samples
    let clientNow: Date;
    let lastSyncPacket: ServerData;
    const syncSamples: number[] = [];
    do {
      const info: ServerData = await this.getServerInfo();
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
    const rtt =
      syncSamples.reduce((acc, val) => acc + val) / syncSamples.length;
    const serverTime = lastSyncPacket.server.getTime() + rtt / 2;

    return {
      offset: serverTime - clientNow.getTime(),
      error: rtt / 2,
    };
  }
}

export const localSocket = new Socket(`ws://${window.location.host}/ws/`);
