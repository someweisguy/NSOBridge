import { ServerInfoType } from "../types/ws";
import { dateReviver } from "../utils/revivers";

type CallbackType<T = unknown> = (data: T) => void;

interface API {
  cache: object[][];
  connect: boolean;
  sync: ServerInfoType;
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

  private receiveMessage<K extends keyof API>(
    type: K,
    timeout = 5000,
  ): Promise<API[K]> {
    return new Promise((resolve, reject) => {
      let resolutions: CallbackType[] | undefined =
        this.allResolutions.get(type);
      resolutions ??= [];

      resolutions.push(resolve as CallbackType);
      this.allResolutions.set(type, resolutions);
      setTimeout(() => reject(new Error("WebSocket timed out")), timeout);
    });
  }

  constructor(url: string) {
    this.connect(url);
  }

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.handleEvent("connect", true);
    this.ws.onclose = () => {
      this.handleEvent("connect", false);
      setTimeout(() => this.connect(url), 1000);
    };
    this.ws.onerror = () => this.ws.close();
    this.ws.onmessage = <K extends keyof API>(event: MessageEvent<string>) => {
      const { type, data } = JSON.parse(event.data, dateReviver) as {
        type: K;
        data: API[K];
      };
      this.handleEvent(type, data);
    };
  }

  registerCallback<T extends keyof API>(
    type: T,
    cb: CallbackType<API[T]>,
  ): void {
    let callbacks: CallbackType[] | undefined = this.allCallbacks.get(type);
    callbacks ??= [];
    callbacks.push(cb as unknown as CallbackType);

    this.allCallbacks.set(type, callbacks);
  }

  async getServerInfo(): Promise<ServerInfoType> {
    // Wait until the WebSocket is connected
    if (this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.receiveMessage("connect").catch(() => false);
      if (!connected) {
        throw new Error("Could not get server info (not connected)");
      }
    }

    this.ws.send(JSON.stringify({ process: new Date() }));
    return this.receiveMessage("sync");
  }
}

export const localSocket = new Socket(`ws://${window.location.host}/ws/`);
