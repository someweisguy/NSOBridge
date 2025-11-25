export default class API {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  private async genericRequest<T = unknown>(
    endpoint: string,
    method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
    query?: URLSearchParams | Record<string, unknown>,
    body?: string | number | boolean | object | null,
  ): Promise<T> {
    // Generate the request URL
    const url = new URL(`/api/${endpoint}`, this.host);
    if (query !== undefined) {
      url.search = new URLSearchParams(
        query as Record<string, string>,
      ).toString();
    }

    // Send the request
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body instanceof Object ? JSON.stringify(body) : body?.toString(),
    });

    // Parse the response
    if (!response.ok) {
      const error = (await response.json()) as { message: string };
      throw new Error(error.message);
    }
    return (await response.json()) as T;
  }

  async get<T = unknown>(
    endpoint: string,
    query?: URLSearchParams | Record<string, unknown>,
  ): Promise<T> {
    return this.genericRequest(endpoint, "GET", query);
  }

  async head<T = unknown>(
    endpoint: string,
    query?: URLSearchParams | Record<string, unknown>,
  ): Promise<T> {
    return this.genericRequest(endpoint, "HEAD", query);
  }

  async post<T = unknown>(
    endpoint: string,
    query?: URLSearchParams | Record<string, unknown>,
    body?: string | number | boolean | object | null,
  ): Promise<T> {
    return this.genericRequest(endpoint, "POST", query, body);
  }

  async put<T = unknown>(
    endpoint: string,
    query?: URLSearchParams | Record<string, unknown>,
    body?: string | number | boolean | object | null,
  ): Promise<T> {
    return this.genericRequest(endpoint, "PUT", query, body);
  }

  async delete<T = unknown>(
    endpoint: string,
    query?: URLSearchParams | Record<string, unknown>,
    body?: string | number | boolean | object | null,
  ): Promise<T> {
    return this.genericRequest(endpoint, "DELETE", query, body);
  }
}

export const localAPI = new API(window.location.href);
