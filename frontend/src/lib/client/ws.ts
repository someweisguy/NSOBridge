import "@/lib/client/sync.ts";

export type UpdateKey = ["bouts", string] | ["jams", string, number, number];

export class UpdateEvent extends Event {
  constructor(public readonly key: UpdateKey) {
    super("update");
  }
}

export class ConnectionEvent extends Event {
  constructor(public readonly online: boolean) {
    super("connection");
  }
}

export class SyncEvent extends Event {
  constructor(public readonly data: SyncData) {
    super("sync");
  }
}

export interface SyncData {
  process: Date;
  server: Date;
}

declare global {
  interface WindowEventMap {
    connection: ConnectionEvent;
    sync: SyncEvent;
    update: UpdateEvent;
  }
}

interface SyncSchema {
  type: "sync";
  data: SyncData;
}

interface UpdateSchema {
  type: "update";
  data: UpdateKey[];
}

const socket: WebSocket = new WebSocket(`ws://${window.location.host}/ws/`);
socket.onopen = () => window.dispatchEvent(new ConnectionEvent(true));
socket.onclose = () => window.dispatchEvent(new ConnectionEvent(false));
socket.onmessage = (event: MessageEvent<string>) => {
  const payload = JSON.parse(event.data) as SyncSchema | UpdateSchema;
  if (payload.type === "sync") {
    window.dispatchEvent(new SyncEvent(payload.data));
  } else if (payload.type === "update") {
    for (const update of payload.data) {
      window.dispatchEvent(new UpdateEvent(update));
    }
  } else {
    // TODO: log invalid data type
  }
};
