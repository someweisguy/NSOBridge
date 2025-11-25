import { dateReviver } from "@/utils/revivers";

interface URLParameters {
  query?: URLSearchParams | Record<string, unknown>;
  body?: string | number | boolean | object | null;
}

export default class API {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  private async sendRequest<T = unknown>(
    endpoint: string,
    method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
    params?: URLParameters,
  ): Promise<T> {
    // Generate the request URL
    const url = new URL(`/api/${endpoint}`, this.host);
    if (params?.query !== undefined) {
      url.search = new URLSearchParams(
        params.query as Record<string, string>,
      ).toString();
    }

    // Send the request
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body:
        params?.body instanceof Object
          ? JSON.stringify(params.body)
          : params?.body?.toString(),
    });

    // Check for (and raise) errors in the response
    if (!response.ok) {
      const error = (await response.json()) as { message: string };
      throw new Error(error.message);
    }

    // Get the response and revive any Date values
    const text: string = await response.text();
    return JSON.parse(text, dateReviver) as T;
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Omit<URLParameters, "body">,
  ): Promise<T> {
    return this.sendRequest(endpoint, "GET", params);
  }

  async head<T = unknown>(
    endpoint: string,
    params?: Omit<URLParameters, "body">,
  ): Promise<T> {
    return this.sendRequest(endpoint, "HEAD", params);
  }

  async post<T = unknown>(
    endpoint: string,
    params?: URLParameters,
  ): Promise<T> {
    return this.sendRequest(endpoint, "POST", params);
  }

  async put<T = unknown>(endpoint: string, params?: URLParameters): Promise<T> {
    return this.sendRequest(endpoint, "PUT", params);
  }

  async delete<T = unknown>(
    endpoint: string,
    params?: URLParameters,
  ): Promise<T> {
    return this.sendRequest(endpoint, "DELETE", params);
  }
}

export const localAPI = new API(window.location.href);
