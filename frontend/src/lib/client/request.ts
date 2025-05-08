import "@/lib/client/sync.ts";
import { getServerTimedelta } from "@/lib/client/sync.ts";

export type UpdateKey =
  | ["series"]
  | ["bout", string]
  | ["jam", string, number, number];

export class APIEvent extends Event {
  constructor(public readonly key: UpdateKey) {
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
  const updates = JSON.parse(event.data) as UpdateKey[];

  for (const update of updates) {
    console.log("WS: ", update); // TODO
    window.dispatchEvent(new APIEvent(update));
  }
};

export function sanitizeForClient<T = object>(obj: T): T {
  for (const key in obj) {
    if (typeof obj[key] === "string" && !isNaN(Date.parse(obj[key]))) {
      obj[key] = new Date(
        new Date(obj[key]).getTime() + getServerTimedelta()
      ) as T[Extract<keyof T, string>];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeForClient(obj[key]); // Handle nested objects
    }
  }
  return obj;
}

export function sanitizeForServer<T = object>(obj: T): T {
  for (const key in obj) {
    if (obj[key] instanceof Date) {
      obj[key] = new Date(
        obj[key].getTime() - getServerTimedelta()
      ).toISOString() as T[Extract<keyof T, string>];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeForServer(obj[key]); // Handle nested objects
    }
  }
  return obj;
}

export default async function genericRequest<T = unknown>(
  endpoint: `/${string}`,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object
): Promise<APIResponse<T>> {
  const url = new URL(`http://${window.location.host}/api${endpoint}`);
  if (data) {
    data = sanitizeForServer(data);
    url.search = new URLSearchParams(data as Record<string, string>).toString();
  }
  const response = await fetch(url, { method });
  const payload = (await response.json()) as APIResponse<T>;
  if (!payload.success) {
    throw new Error("A request error occurred"); // TODO: better error handling
  }
  return payload;
}
