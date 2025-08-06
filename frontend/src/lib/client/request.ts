import "@/lib/client/sync.ts";
import { getServerTimedelta, timeIsSynchronized } from "@/lib/client/sync.ts";


export interface APIResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: Date;
}


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
