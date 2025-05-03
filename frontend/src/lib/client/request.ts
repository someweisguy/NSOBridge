export class APIEvent<T = unknown> extends Event {
  constructor(
    public readonly key: unknown[],
    public readonly data: T,
    public readonly timestamp: Date,
    public readonly actors: string | null
  ) {
    super("update");
  }
}

export class ConnectionEvent extends Event {
  constructor(public readonly online: boolean) {
    super("connection");
  }
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: Date;
}

declare global {
  interface WindowEventMap {
    connection: ConnectionEvent;
    update: APIEvent;
  }
}

const socket: WebSocket = new WebSocket(
  `ws://${window.location.host}/ws/updates`
);
socket.onopen = () => window.dispatchEvent(new ConnectionEvent(true));
socket.onclose = () => window.dispatchEvent(new ConnectionEvent(false));
socket.onmessage = (event: MessageEvent<string>) => {
  const updates = JSON.parse(event.data) as {
    key: unknown[];
    data: unknown;
    timestamp: Date;
    actor: string | null;
  }[];

  for (const update of updates) {
    console.log("WS: ", update);
    window.dispatchEvent(
      new APIEvent(update.key, update.data, update.timestamp, update.actor)
    );
  }
};

export default async function genericRequest<T = unknown>(
  endpoint: `/${string}`,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object
): Promise<APIResponse<T>> {
  const response = await fetch(
    `http://${window.location.host}/api${endpoint}`,
    {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    }
  );
  return (await response.json()) as APIResponse<T>;
}
