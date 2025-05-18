import "@/lib/client/sync.ts";
import { getServerTimedelta, timeIsSynchronized } from "@/lib/client/sync.ts";

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

export async function sanitizeForClient<T = object>(obj: T): Promise<T> {
  for (const key in obj) {
    if (typeof obj[key] === "string" && !isNaN(Date.parse(obj[key]))) {
      await timeIsSynchronized;
      obj[key] = new Date(
        new Date(obj[key]).getTime() + getServerTimedelta()
      ) as T[Extract<keyof T, string>];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      await sanitizeForClient(obj[key]); // Handle nested objects
    }
  }
  return obj;
}

export async function sanitizeForServer<T = object>(obj: T): Promise<T> {
  for (const key in obj) {
    if (obj[key] instanceof Date) {
      await timeIsSynchronized;
      obj[key] = new Date(
        obj[key].getTime() - getServerTimedelta()
      ).toISOString() as T[Extract<keyof T, string>];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      await sanitizeForServer(obj[key]); // Handle nested objects
    }
  }
  return obj;
}

export default async function genericRequest<T = unknown>(
  endpoint: `/${string}`,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  query: object | null = null,
  body?: string | number | boolean | object | null,
  sanitize = true
): Promise<T> {
  const url = new URL(endpoint, window.location.href);
  if (query !== null) {
    query = sanitize ? await sanitizeForServer(query) : query;
    url.search = new URLSearchParams(
      query as Record<string, string>
    ).toString();
  }
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("A request error occurred"); // TODO: better error handling
  }
  const payload: unknown = await response.json();
  return (sanitize ? await sanitizeForClient(payload) : payload) as Promise<T>;
}
