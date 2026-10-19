import { http, HttpResponse, JsonBodyType } from "msw";
import httpStatus from "node-http-status";
import { InputType } from "storybook/internal/csf";
import { v4 as uuid4 } from "uuid";

export const jamStopReasonArgType: InputType = {
  control: "select",
  options: ["called", "elapsed", "injury", "other", null],
};

export const boutStateArgType: InputType = {
  control: "select",
  options: ["jam", "lineup", "timeout", "final", "stopped"],
};

export const boutSubStateArgType: InputType = {
  control: "select",
  options: [
    "pregame",
    "halftime",
    "unofficial",
    "lineup",
    "post_review",
    "post_timeout",
    "jam",
    "timeout",
    "review",
    "team_timeout",
    "official_timeout",
    "final",
  ],
};

/**
 * Create a storybook-msw mock endpoint.
 *
 * @param endpoint The HTTP endpoint URL.
 * @param data The mocked endpoint return data.
 * @returns A storybook-msw mock handler.
 */
export function getHandlerFactory<T = JsonBodyType>(
  endpoint: string,
  data: T,
  params: Record<string, unknown> = {},
) {
  return http.get(`/api/${endpoint}`, ({ request }) => {
    const url = new URL(request.url);
    const urlParams = Object.fromEntries(url.searchParams);
    const paramsKeys = Object.keys(params);
    const urlKeys = Object.keys(urlParams);

    // Check for parameter equality - shallow comparison is okay here!
    const match =
      paramsKeys.length == urlKeys.length &&
      paramsKeys.every(
        (key) => url.searchParams.has(key) && params[key] == urlParams[key],
      );

    if (match) {
      return HttpResponse.json({
        transactionUuid: uuid4(),
        statusCode: httpStatus.OK,
        timestamp: new Date().toString(),
        data,
      });
    }
  });
}
