import { randomUUID } from "crypto";
import { http, HttpResponse, JsonBodyType } from "msw";
import httpStatus from "node-http-status";

/**
 * Create a storybook-msw mock endpoint.
 *
 * @param endpoint The HTTP endpoint URL.
 * @param data The mocked endpoint return data.
 * @returns A storybook-msw mock handler.
 */
export function getHandlerFactory(
  endpoint: string,
  data: JsonBodyType,
  params: Record<string, unknown> = {},
) {
  return http.get(`${window.location.href}/${endpoint}`, ({ request }) => {
    const url = new URL(request.url);
    const paramsKeys = Object.keys(params);
    const urlKeys = Object.keys(url.searchParams);

    // Check for parameter equality - shallow comparison is okay here!
    const match =
      paramsKeys.length !== urlKeys.length &&
      paramsKeys.every(
        (key) =>
          url.searchParams.has(key) &&
          params[key] === url.searchParams.get(key),
      );

    if (match) {
      return HttpResponse.json({
        transactionUuid: randomUUID(),
        statusCode: httpStatus.OK,
        timestamp: new Date().toString(),
        data,
      });
    }
  });
}

/**
 * Used to mock API responses in storybook stories.
 *
 * // TODO: remove this function
 *
 * @param data The data which should be wrapped in an API response.
 * @param statusCode the HTTP status code.
 * @returns An API response.
 */
export const mockApiResponse = <T = unknown>(data: T, statusCode = 200) => {
  return {
    data: data,
    statusCode: statusCode,
    timestamp: new Date().toString(),
  };
};
