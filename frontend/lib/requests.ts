export default async function genericRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH",
  query?: Record<string, unknown>,
  body?: string | number | boolean | object | null,
): Promise<T> {
  // Generate the request URL
  const url = new URL(
    `/api/${endpoint}${query == null ? "/" : ""}`,
    window.location.href,
  );
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
