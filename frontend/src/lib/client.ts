import { QueryClient } from "@tanstack/react-query";

interface APIResponse<T = object> {
  success: boolean;
  data: T;
  timestamp: Date;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      staleTime: Infinity,
    },
  },
});

export default async function genericRequest<T = object>(
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
