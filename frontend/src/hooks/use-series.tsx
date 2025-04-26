import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";
import genericRequest, { APIResponse } from "../lib/client";

export default function useSeries(): Map<string, object> {
  const { data } = useSuspenseQuery<APIResponse, unknown, Map<string, object>>({
    queryKey: keyFactory.series(),
    queryFn: () => genericRequest<Map<string, object>>("/series", "GET"),
    select: (response: APIResponse) => new Map(Object.entries(response.data)),
  });

  return data;
}
