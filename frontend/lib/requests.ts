import { dateReviver } from "@/utils/revivers";

interface URLParameters {
  query?: URLSearchParams | Record<string, unknown>;
  body?: string | number | boolean | object | null;
}

interface APIResponse<T = unknown> {
  statusCode: number;
  data: T;
  error?: {
    type: string;
    message: string;
    description: string;
  };
  timestamp: string;
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
  ): Promise<APIResponse<T>> {
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
    const payload = JSON.parse(text, dateReviver) as APIResponse<T>;

    console.log(typeof payload);
    return payload;
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Omit<URLParameters, "body">,
  ): Promise<T> {
    const response: APIResponse<T> = await this.sendRequest(
      endpoint,
      "GET",
      params,
    );
    return response.data;
  }

  async head<T = unknown>(
    endpoint: string,
    params?: Omit<URLParameters, "body">,
  ): Promise<T> {
    const response: APIResponse<T> = await this.sendRequest(
      endpoint,
      "HEAD",
      params,
    );
    return response.data;
  }

  async post<T = unknown>(
    endpoint: string,
    params?: URLParameters,
  ): Promise<T> {
    const response: APIResponse<T> = await this.sendRequest(
      endpoint,
      "POST",
      params,
    );
    return response.data;
  }

  async put<T = unknown>(endpoint: string, params?: URLParameters): Promise<T> {
    const response: APIResponse<T> = await this.sendRequest(
      endpoint,
      "PUT",
      params,
    );
    return response.data;
  }

  async delete<T = unknown>(
    endpoint: string,
    params?: URLParameters,
  ): Promise<T> {
    const response: APIResponse<T> = await this.sendRequest(
      endpoint,
      "DELETE",
      params,
    );
    return response.data;
  }
}

export const localAPI = new API(window.location.href);
